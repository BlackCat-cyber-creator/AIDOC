'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { PatientProfile } from '@/lib/schema';
import { PatientProfileForm } from '@/components/forms/PatientProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Crown, Stethoscope, History } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLoading } from '@/components/LoadingProvider';
import Carousel from '@/components/ui/carousel';
import { useUser } from '@/components/UserProvider';
import { PatientHistoryList } from '@/components/history/PatientHistoryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProfileWithDocId = PatientProfile & { docId: string };

const FREE_PROFILE_LIMIT = 2;
const PRO_PROFILE_LIMIT = 5;
const FREE_DAILY_LIMIT = 4;
const PRO_DAILY_LIMIT = 25;

export default function ProfilesPage() {
  const [user, loading] = useAuthState(auth);
  const { settings } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ProfileWithDocId[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithDocId | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<ProfileWithDocId | null>(null);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();

  const isPremium = settings.isPremium;
  const diagnosisCount = settings.diagnosisCount;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      fetchProfiles();
      checkDailyReset();
    }
  }, [user, loading, router]);

  const checkDailyReset = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastDiagnosisDate !== today) {
      await updateDoc(doc(db, 'users', user.uid), { diagnosisCount: 0, lastDiagnosisDate: today });
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;
    setIsProfilesLoading(true);
    try {
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
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (values: PatientProfile) => {
    if (!user) return;

    const limit = isPremium ? PRO_PROFILE_LIMIT : FREE_PROFILE_LIMIT;
    if (profiles.length >= limit && !selectedProfile) {
      alert(isPremium ? t('premium_limit_reached') : t('upgrade_premium'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedProfile?.docId) {
        const profileDoc = doc(db, 'users', user.uid, 'userProfile', selectedProfile.docId);
        await setDoc(profileDoc, { ...values, id: user.uid }, { merge: true });
      } else {
        const profilesCollection = collection(db, 'users', user.uid, 'userProfile');
        await addDoc(profilesCollection, { ...values, id: user.uid });
      }

      setIsFormOpen(false);
      await fetchProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error saving profile: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProfile = (profile: ProfileWithDocId) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (!user || !profileToDelete) return;
    setIsLoading(true);
    try {
      const profileDoc = doc(db, 'users', user.uid, 'userProfile', profileToDelete.docId);
      await deleteDoc(profileDoc);
      await fetchProfiles();
      setIsDeleteDialogOpen(false);
      setProfileToDelete(null);
    } catch (error) {
      console.error('Error deleting profile: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiagnosis = (profile: ProfileWithDocId) => {
    setIsLoading(true);
    const { profile_picture, ...profileData } = profile;
    sessionStorage.setItem('selectedPatientProfile', JSON.stringify(profileData));
    router.push('/diagnosis');
  };

  const currentProfileLimit = isPremium ? PRO_PROFILE_LIMIT : FREE_PROFILE_LIMIT;
  const currentDailyLimit = isPremium ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  const isDiagnosisFull = diagnosisCount >= currentDailyLimit;
  const isProfileFull = profiles.length >= currentProfileLimit;

  const carouselSlides = profiles.map((profile) => ({
    title: profile.name,
    button: t('start_diagnosis'),
    src: profile.profile_picture || '/images/default-profile-bg.jpg',
    age: profile.age,
    sex: profile.sex,
    chronic_conditions: profile.chronic_conditions,
    medications: profile.medications,
    allergies: profile.allergies,
    isAddNew: false,
  }));

  carouselSlides.push({
    title: t('add_new_profile'),
    button: isProfileFull ? t('premium_limit_reached') : t('create_account'),
    src: '',
    age: '',
    sex: '',
    isAddNew: true,
  });

  const handleAddNewProfile = () => {
    if (isProfileFull) {
      alert(isPremium ? t('premium_limit_reached') : t('upgrade_premium'));
    } else {
      setSelectedProfile(null);
      setIsFormOpen(true);
    }
  };

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

        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <User className="h-4 w-4" /> {t('profiles', 'Profiles')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> {t('history', 'History')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            {isProfilesLoading && profiles.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
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
                ))}
              </div>
            ) : (
              <div className="mb-12">
                <Carousel
                  slides={carouselSlides}
                  t={t}
                  onSlideClick={(index) => {}}
                  onEditProfile={(index) => {
                    if (index < profiles.length) {
                      setSelectedProfile(profiles[index]);
                      setIsFormOpen(true);
                    }
                  }}
                  onDeleteProfile={(index) => {
                    if (index < profiles.length) {
                      confirmDeleteProfile(profiles[index]);
                    }
                  }}
                  onStartDiagnosis={(index) => {
                    if (index < profiles.length) {
                      handleStartDiagnosis(profiles[index]);
                    }
                  }}
                  onAddNewProfile={handleAddNewProfile}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-2xl mx-auto">
              <PatientHistoryList />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Dialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) {
                setIsSubmitting(false);
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedProfile ? t('edit_profile') : t('add_new_profile')}</DialogTitle>
                <DialogDescription>{t('profiles_desc')}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto p-1">
                <PatientProfileForm
                  onSubmit={handleFormSubmit}
                  initialData={selectedProfile || undefined}
                  isPremium={isPremium}
                  isLoading={isSubmitting}
                  submitButtonText={selectedProfile ? t('update_profile') : t('save_profile')}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete_profile')}</AlertDialogTitle>
              <AlertDialogDescription>{t('delete_confirm', { name: profileToDelete?.name })}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive hover:bg-destructive/80">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <AppFooter />
    </div>
  );
}
