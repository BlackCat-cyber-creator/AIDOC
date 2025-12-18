'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { PatientProfile } from '@/lib/schema';
import { PatientProfileForm } from '@/components/forms/PatientProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, User, Trash2, Edit, Crown, Stethoscope } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/components/LoadingProvider'; // Import useLoading

type ProfileWithDocId = PatientProfile & { docId: string };

const FREE_PROFILE_LIMIT = 2;
const PRO_PROFILE_LIMIT = 10;
const FREE_DAILY_LIMIT = 6;
const PRO_DAILY_LIMIT = 50;

export default function ProfilesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ProfileWithDocId[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithDocId | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [diagnosisCount, setDiagnosisCount] = useState(0);
  const { setIsLoading } = useLoading(); // Get setIsLoading from context

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      fetchUserDataAndProfiles();
    }
  }, [user, loading, router]);

  const fetchUserDataAndProfiles = async () => {
    if (!user) return;
    setIsProfilesLoading(true);
    setIsLoading(true); // Set global loading to true when fetching profiles
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const today = new Date().toISOString().split('T')[0];

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsPremium(userData.isPremium || false);

        if (userData.lastDiagnosisDate === today) {
          setDiagnosisCount(userData.diagnosisCount || 0);
        } else {
          setDiagnosisCount(0);
          await updateDoc(doc(db, 'users', user.uid), { diagnosisCount: 0, lastDiagnosisDate: today });
        }
      }

      const profilesCollection = collection(db, 'users', user.uid, 'userProfile');
      const profilesSnapshot = await getDocs(profilesCollection);
      const profilesData = profilesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      })) as ProfileWithDocId[];
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setIsProfilesLoading(false);
      setIsLoading(false); // Set global loading to false after fetching profiles
    }
  };

  const handleFormSubmit = async (values: PatientProfile) => {
    if (!user) return;

    const limit = isPremium ? PRO_PROFILE_LIMIT : FREE_PROFILE_LIMIT;
    if (profiles.length >= limit && !selectedProfile) {
      alert(isPremium ? t('premium_limit_reached') : t('upgrade_premium'));
      return;
    }

    setIsLoading(true); // Set global loading to true when submitting form
    try {
      if (selectedProfile?.docId) {
        const profileDoc = doc(db, 'users', user.uid, 'userProfile', selectedProfile.docId);
        await setDoc(profileDoc, { ...values, id: user.uid }, { merge: true });
      } else {
        const profilesCollection = collection(db, 'users', user.uid, 'userProfile');
        await addDoc(profilesCollection, { ...values, id: user.uid });
      }
      await fetchUserDataAndProfiles();
      setIsFormOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error saving profile: ', error);
    } finally {
      setIsLoading(false); // Set global loading to false after form submission
    }
  };

  const handleDeleteProfile = async (docId: string) => {
    if (!user) return;
    setIsLoading(true); // Set global loading to true when deleting profile
    try {
      const profileDoc = doc(db, 'users', user.uid, 'userProfile', docId);
      await deleteDoc(profileDoc);
      await fetchUserDataAndProfiles();
    } catch (error) {
      console.error('Error deleting profile: ', error);
    } finally {
      setIsLoading(false); // Set global loading to false after deleting profile
    }
  };

  const handleStartDiagnosis = (profile: ProfileWithDocId) => {
    setIsLoading(true); // Set global loading to true when starting diagnosis
    sessionStorage.setItem('selectedPatientProfile', JSON.stringify(profile));
    router.push('/diagnosis');
  };

  const currentProfileLimit = isPremium ? PRO_PROFILE_LIMIT : FREE_PROFILE_LIMIT;
  const currentDailyLimit = isPremium ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  const isDiagnosisFull = diagnosisCount >= currentDailyLimit;
  const isProfileFull = profiles.length >= currentProfileLimit;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('profiles_title')}</h1>
            <p className="text-lg text-muted-foreground">{t('profiles_desc')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Usage Stats Card */}
            <Card
              className={cn(
                'p-4 flex items-center gap-3 min-w-[180px] transition-colors border',
                isDiagnosisFull
                  ? 'bg-muted/50 border-muted text-muted-foreground'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              )}
            >
              <Stethoscope className={cn('h-5 w-5', isDiagnosisFull ? 'text-muted-foreground' : 'text-blue-600')} />
              <div className="text-sm">
                <p className="font-semibold">{t('daily_diagnosis')}</p>
                <p className={isDiagnosisFull ? 'text-muted-foreground' : 'text-blue-700'}>
                  {diagnosisCount}/{currentDailyLimit} {t('used')}
                </p>
              </div>
            </Card>

            {/* Subscription Card */}
            <Card
              className={cn(
                'p-4 flex items-center gap-3 min-w-[180px] transition-colors border',
                isProfileFull
                  ? 'bg-muted/50 border-muted text-muted-foreground'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              )}
            >
              {isPremium ? (
                <Crown className={cn('h-5 w-5', isProfileFull ? 'text-muted-foreground' : 'text-yellow-600')} />
              ) : (
                <User className={cn('h-5 w-5', isProfileFull ? 'text-muted-foreground' : 'text-yellow-600')} />
              )}

              <div className="text-sm">
                <p className="font-semibold">{isPremium ? t('premium_account') : t('free_account')}</p>
                <p className={isProfileFull ? 'text-muted-foreground' : 'text-yellow-700'}>
                  {profiles.length}/{currentProfileLimit} {t('profiles')}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isProfilesLoading || loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="flex flex-col h-[280px] animate-pulse">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {profiles.map((profile) => (
                <Card
                  key={profile.docId}
                  className="flex flex-col hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-bold">{profile.name}</CardTitle>
                      <CardDescription>
                        {profile.age} {t('age')} • {t(profile.sex)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">{t('conditions')}:</span>{' '}
                      {profile.chronic_conditions || t('none')}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">{t('medications')}:</span>{' '}
                      {profile.medications || t('none')}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">{t('allergies')}:</span>{' '}
                      {profile.allergies || t('none')}
                    </div>
                  </CardContent>
                  <div className="p-4 flex justify-between items-center border-t bg-muted/5">
                    <Button onClick={() => handleStartDiagnosis(profile)} size="sm">
                      {t('start_diagnosis')}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('delete_profile')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('delete_confirm', { name: profile.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProfile(profile.docId)}
                              className="bg-destructive hover:bg-destructive/80"
                            >
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}

              <Dialog
                open={isFormOpen}
                onOpenChange={(open) => {
                  setIsFormOpen(open);
                  if (open) {
                    // Only set loading if the dialog is actually opening and not due to a limit alert
                    if (!isProfileFull) {
                      setIsLoading(true);
                    }
                  } else {
                    setIsLoading(false);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-full min-h-[200px] flex-col gap-4 border-dashed hover:border-primary hover:bg-primary/5 transition-all',
                      isProfileFull && 'opacity-60 grayscale cursor-not-allowed border-muted'
                    )}
                    onClick={(e) => {
                      if (isProfileFull) {
                        e.preventDefault();
                        alert(isPremium ? t('premium_limit_reached') : t('upgrade_premium'));
                      } else {
                        setSelectedProfile(null);
                      }
                    }}
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <PlusCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-semibold">{t('add_new_profile')}</p>
                      <p className="text-sm text-muted-foreground">
                        {isProfileFull ? t('premium_limit_reached') : t('create_account')}
                      </p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{selectedProfile ? t('edit_profile') : t('add_new_profile')}</DialogTitle>
                    <DialogDescription>{t('profiles_desc')}</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto p-1">
                    <PatientProfileForm
                      onSubmit={handleFormSubmit}
                      initialData={selectedProfile || undefined}
                      // isLoading={isLoading} // PatientProfileForm already handles its own loading state
                      isPremium={isPremium}
                      submitButtonText={selectedProfile ? t('update_profile') : t('save_profile')}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
