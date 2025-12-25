'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const isIndonesian = i18n.language === 'id';

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back_to_login')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{isIndonesian ? 'Kebijakan Privasi' : 'Privacy Policy'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isIndonesian ? 'Terakhir diperbarui: 25 Desember 2025' : 'Last updated: December 25, 2025'}
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          {isIndonesian ? (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">1. Pendahuluan</h2>
                <p>
                  AIDOC ("kami", "milik kami", atau "kita") berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi
                  ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda
                  menggunakan aplikasi seluler dan layanan kami.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Informasi yang Kami Kumpulkan</h2>
                <p>Kami mengumpulkan informasi untuk memberikan layanan yang lebih baik kepada semua pengguna kami:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Informasi Profil:</strong> Nama, usia, jenis kelamin, dan riwayat kesehatan yang Anda
                    masukkan untuk membuat profil pasien.
                  </li>
                  <li>
                    <strong>Data Gejala:</strong> Lokasi gejala, deskripsi, foto (jika diunggah), dan detail lain yang
                    Anda berikan selama proses diagnosis.
                  </li>
                  <li>
                    <strong>Informasi Akun:</strong> Alamat email yang digunakan untuk pendaftaran dan otentikasi.
                  </li>
                  <li>
                    <strong>Data Perangkat:</strong> Informasi dasar tentang perangkat Anda untuk memastikan aplikasi
                    berfungsi dengan benar.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Cara Kami Menggunakan Informasi Anda</h2>
                <p>Kami menggunakan data yang dikumpulkan untuk:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Memberikan analisis gejala bertenaga AI dan potensi diagnosis.</li>
                  <li>Mengelola akun dan profil pasien Anda.</li>
                  <li>Meningkatkan fungsionalitas dan akurasi AI kami.</li>
                  <li>Berkomunikasi dengan Anda mengenai akun Anda.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Berbagi Data dan Keamanan</h2>
                <p>
                  Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Data medis Anda diproses secara aman.
                  Kami menggunakan Firebase (layanan Google) untuk penyimpanan data dan otentikasi yang aman.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Privasi Anak-anak</h2>
                <p>
                  Meskipun AIDOC dapat digunakan untuk mengelola profil anak-anak (oleh orang tua atau wali), kami tidak
                  secara sengaja mengumpulkan data pribadi langsung dari anak-anak di bawah usia 13 tahun tanpa izin
                  orang tua. Orang tua/wali memiliki kontrol penuh atas data yang dimasukkan untuk anak-anak mereka.
                </p>
              </section>

              <section id="deletion">
                <h2 className="text-xl font-semibold">6. Penghapusan Akun dan Data</h2>
                <p>
                  Anda memiliki hak untuk meminta penghapusan akun dan data terkait Anda kapan saja. Berikut adalah cara
                  untuk meminta penghapusan:
                </p>
                <div className="bg-muted p-4 rounded-lg my-4">
                  <p className="font-medium mb-2">Langkah-langkah penghapusan:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>
                      Kirim email ke{' '}
                      <a href="mailto:aidocsymptomchecker@gmail.com" className="text-primary underline">
                        aidocsymptomchecker@gmail.com
                      </a>
                      .
                    </li>
                    <li>Gunakan subjek "Permintaan Penghapusan Akun".</li>
                    <li>Sertakan alamat email yang terdaftar pada aplikasi AIDOC.</li>
                  </ol>
                </div>
                <p>
                  <strong>Data yang akan dihapus:</strong>
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Informasi profil akun (nama, email).</li>
                  <li>Semua profil pasien yang dibuat.</li>
                  <li>Seluruh riwayat diagnosis dan data gejala.</li>
                  <li>Foto gejala yang pernah diunggah.</li>
                </ul>
                <p>
                  Setelah permintaan diproses, data Anda akan dihapus secara permanen dari basis data aktif kami dalam
                  waktu 7 hari kerja. Data dalam cadangan (backups) akan terhapus sepenuhnya dalam waktu maksimal 30
                  hari sebagai bagian dari siklus pembersihan rutin kami. Kami tidak menyimpan data pribadi Anda setelah
                  periode ini, kecuali diwajibkan oleh hukum.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Hak Anda lainnya</h2>
                <p>
                  Anda dapat mengakses dan memperbarui profil pasien dan informasi akun Anda kapan saja langsung melalui
                  pengaturan dalam aplikasi AIDOC.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Kontak Kami</h2>
                <p>
                  Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:{' '}
                  <a href="mailto:aidocsymptomchecker@gmail.com" className="text-primary underline">
                    aidocsymptomchecker@gmail.com
                  </a>
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>
                  AIDOC ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
                  we collect, use, and safeguard your information when you use our mobile application and services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                <p>We collect information to provide better services to all our users:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Profile Information:</strong> Name, age, sex, and medical history you enter to create
                    patient profiles.
                  </li>
                  <li>
                    <strong>Symptom Data:</strong> Symptom locations, descriptions, photos (if uploaded), and other
                    details you provide during the diagnosis process.
                  </li>
                  <li>
                    <strong>Account Information:</strong> Email address used for registration and authentication.
                  </li>
                  <li>
                    <strong>Device Data:</strong> Basic information about your device to ensure the app functions
                    correctly.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                <p>We use the collected data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide AI-powered symptom analysis and potential diagnoses.</li>
                  <li>Manage your account and patient profiles.</li>
                  <li>Improve our AI's functionality and accuracy.</li>
                  <li>Communicate with you regarding your account.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Data Sharing and Security</h2>
                <p>
                  We do not sell your personal information to third parties. Your medical data is processed securely. We
                  use Firebase (a Google service) for secure data storage and authentication.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Children's Privacy</h2>
                <p>
                  While AIDOC can be used to manage children's profiles (by parents or guardians), we do not knowingly
                  collect personal data directly from children under the age of 13 without parental consent.
                  Parents/guardians have full control over the data entered for their children.
                </p>
              </section>

              <section id="deletion-en">
                <h2 className="text-xl font-semibold">6. Account and Data Deletion</h2>
                <p>
                  You have the right to request the deletion of your account and associated data at any time. Here is
                  how you can request deletion:
                </p>
                <div className="bg-muted p-4 rounded-lg my-4">
                  <p className="font-medium mb-2">Deletion Steps:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>
                      Send an email to{' '}
                      <a href="mailto:aidocsymptomchecker@gmail.com" className="text-primary underline">
                        aidocsymptomchecker@gmail.com
                      </a>
                      .
                    </li>
                    <li>Use the subject line "Account Deletion Request".</li>
                    <li>Include the email address registered with the AIDOC app.</li>
                  </ol>
                </div>
                <p>
                  <strong>Data that will be deleted:</strong>
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Account profile information (name, email).</li>
                  <li>All created patient profiles.</li>
                  <li>All diagnosis history and symptom data.</li>
                  <li>Any uploaded symptom photos.</li>
                </ul>
                <p>
                  Once a request is processed, your data will be permanently removed from our active databases within 7
                  business days. Data in backups will be fully deleted within a maximum of 30 days as part of our
                  routine cleanup cycles. We do not retain your personal data after this period unless required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Your Other Rights</h2>
                <p>
                  You can access and update your patient profiles and account information at any time directly through
                  the AIDOC app settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:{' '}
                  <a href="mailto:aidocsymptomchecker@gmail.com" className="text-primary underline">
                    aidocsymptomchecker@gmail.com
                  </a>
                </p>
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
