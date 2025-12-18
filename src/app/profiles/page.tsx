'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { PatientProfile } from '@/lib/schema';
import { PatientProfileForm } from '@/components/forms/PatientProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, User, Trash2, Edit, Loader2, Crown, Image as ImageIcon } from 'lucide-react';
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

type ProfileWithDocId = PatientProfile & { docId: string };

const FREE_PROFILE_LIMIT = 2;

export default function ProfilesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithDocId[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithDocId | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      checkSubscriptionAndFetchProfiles();
    }
  }, [user, loading, router]);

  const checkSubscriptionAndFetchProfiles = async () => {
    if (!user) return;
    setIsProfilesLoading(true);
    try {
      // Check premium status
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setIsPremium(userDoc.data().isPremium || false);
      }

      // Fetch profiles
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
    }
  };

  const handleFormSubmit = async (values: PatientProfile) => {
    if (!user) return;

    // Check limit for free users
    if (!isPremium && profiles.length >= FREE_PROFILE_LIMIT && !selectedProfile) {
      alert('Free users are limited to 2 profiles. Upgrade to Premium for unlimited profiles!');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedProfile?.docId) {
        const profileDoc = doc(db, 'users', user.uid, 'userProfile', selectedProfile.docId);
        await setDoc(profileDoc, { ...values, id: user.uid }, { merge: true });
      } else {
        const profilesCollection = collection(db, 'users', user.uid, 'userProfile');
        await addDoc(profilesCollection, { ...values, id: user.uid });
      }
      await checkSubscriptionAndFetchProfiles();
      setIsFormOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error saving profile: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (docId: string) => {
    if (!user) return;
    try {
      const profileDoc = doc(db, 'users', user.uid, 'userProfile', docId);
      await deleteDoc(profileDoc);
      await checkSubscriptionAndFetchProfiles();
    } catch (error) {
      console.error('Error deleting profile: ', error);
    }
  };

  const handleStartDiagnosis = (profile: ProfileWithDocId) => {
    sessionStorage.setItem('selectedPatientProfile', JSON.stringify(profile));
    router.push('/diagnosis');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader />
      <main className="container mx-auto flex-grow px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="mb-8 border-none shadow-none bg-transparent px-0">
          <CardHeader className="px-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Patient Profiles</CardTitle>
              <CardDescription className="text-lg">Manage profiles for your AI medical diagnosis.</CardDescription>
            </div>
            {!isPremium && (
              <Card className="bg-yellow-50 border-yellow-200 p-4 hidden md:flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Free Account</p>
                  <p className="text-yellow-700">
                    {profiles.length}/{FREE_PROFILE_LIMIT} profiles used
                  </p>
                </div>
              </Card>
            )}
          </CardHeader>
        </Card>

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
                      <AvatarImage src={profile.imageUrl} alt={profile.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-bold">{profile.name}</CardTitle>
                      <CardDescription>
                        {profile.age} years old • {profile.sex}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">Conditions:</span>{' '}
                      {profile.chronic_conditions || 'None'}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-muted-foreground">Medications:</span>{' '}
                      {profile.medications || 'None'}
                    </div>
                  </CardContent>
                  <div className="p-4 flex justify-between items-center border-t bg-muted/5">
                    <Button onClick={() => handleStartDiagnosis(profile)} size="sm">
                      Start Diagnosis
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
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the profile for {profile.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProfile(profile.docId)}
                              className="bg-destructive hover:bg-destructive/80"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}

              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-full min-h-[200px] flex-col gap-4 border-dashed hover:border-primary hover:bg-primary/5 transition-all',
                      !isPremium &&
                        profiles.length >= FREE_PROFILE_LIMIT &&
                        'opacity-60 grayscale cursor-not-allowed border-muted'
                    )}
                    onClick={(e) => {
                      if (!isPremium && profiles.length >= FREE_PROFILE_LIMIT) {
                        e.preventDefault();
                        alert('Upgrade to Premium to add more than 2 profiles!');
                      } else {
                        setSelectedProfile(null);
                      }
                    }}
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <PlusCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-semibold">Add New Profile</p>
                      {!isPremium && profiles.length >= FREE_PROFILE_LIMIT ? (
                        <p className="text-sm text-yellow-600 font-medium">Limit Reached (2/2)</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Create a profile for someone else</p>
                      )}
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{selectedProfile ? 'Edit Profile' : 'Add New Profile'}</DialogTitle>
                    <DialogDescription>Fill in the medical details for this patient.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto p-1">
                    <PatientProfileForm
                      onSubmit={handleFormSubmit}
                      initialData={selectedProfile || undefined}
                      isLoading={isLoading}
                      isPremium={isPremium} // Pass premium status to the form
                      submitButtonText={selectedProfile ? 'Update Profile' : 'Create Profile'}
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
