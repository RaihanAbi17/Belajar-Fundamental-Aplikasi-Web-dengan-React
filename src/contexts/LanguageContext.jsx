import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

// All visible interface text lives here. Never hard-code translated UI text in components.
const translations = {
  id: {
    notes: 'Catatan', archive: 'Arsip', write: 'Tulis Catatan', logout: 'Keluar',
    search: 'Cari berdasarkan judul...', allNotes: 'Semua catatan', archivedNotes: 'Catatan arsip',
    count: 'catatan', newNote: 'Catatan baru', newNoteTitle: 'Ada yang ingin dicatat?',
    titlePlaceholder: 'Beri judul catatan...', bodyPlaceholder: 'Mulai menulis di sini...',
    save: 'Simpan catatan', back: 'Kembali ke catatan', archive: 'Arsipkan', unarchive: 'Keluarkan dari arsip',
    remove: 'Hapus catatan', loading: 'Memuat data...', empty: 'Belum ada catatan',
    emptyArchive: 'Arsip masih kosong', notFound: 'Catatan tidak ditemukan',
    login: 'Masuk', register: 'Daftar', email: 'Email', password: 'Kata sandi', name: 'Nama',
    confirmPassword: 'Konfirmasi kata sandi', noAccount: 'Belum punya akun?', haveAccount: 'Sudah punya akun?',
    createAccount: 'Buat akun', loginTitle: 'Selamat datang kembali', registerTitle: 'Buat akun baru',
    theme: 'Tema', language: 'Bahasa', light: 'Terang', dark: 'Gelap',
    brandName: 'Catatan Pribadi', personalNotes: 'Catatan Pribadi', brandSubtitle: 'Ruang kecil untuk pikiranmu',
    archiveRoom: 'RUANG ARSIP', myNotes: 'CATATAN SAYA',
    archiveHeadline: 'Yang disimpan, tetap berarti.', notesHeadline: 'Simpan ide. Rapikan pikiran.',
    archiveDescription: 'Kumpulan catatan yang kamu arsipkan.',
    notesDescription: 'Tempat untuk rencana, cerita harian, refleksi, dan ide yang ingin kamu ingat.',
    archivedTag: 'Tersimpan di arsip', noteTag: 'Catatan', readNote: 'Buka catatan',
    notFoundSearch: 'Catatan tidak ditemukan', tryAnotherKeyword: 'Coba kata kunci lain.',
    startWriting: 'Mulai tulis sesuatu yang ingin kamu simpan.',
    archiveTag: 'Arsip', privateNote: 'Catatan pribadi',
    deleteConfirm: 'Hapus catatan ini?', processing: 'Memproses...',
    newNoteEyebrow: 'CATATAN BARU', writeFreely: 'Tulis dengan bebas', words: 'kata',
    saving: 'Menyimpan...', authentication: 'AUTENTIKASI',
    loginDescription: 'Masuk untuk mengakses catatan pribadimu.',
    createAccountEyebrow: 'BUAT AKUN', registerDescription: 'Buat akun untuk mulai menyimpan catatan.',
    passwordMismatch: 'Konfirmasi kata sandi tidak sama.',
    pageNotFound: 'Halaman ini belum ada.', tryAgain: 'Coba lagi',
    createdBy: 'Dibuat oleh',
    apiError: 'Terjadi kesalahan saat menghubungi server.',
    errorTitle: 'Terjadi kesalahan',
  },
  en: {
    notes: 'Notes', archive: 'Archive', write: 'Write Note', logout: 'Logout',
    search: 'Search by title...', allNotes: 'All notes', archivedNotes: 'Archived notes',
    count: 'notes', newNote: 'New note', newNoteTitle: 'Anything to write down?',
    titlePlaceholder: 'Give your note a title...', bodyPlaceholder: 'Start writing here...',
    save: 'Save note', back: 'Back to notes', archive: 'Archive', unarchive: 'Unarchive',
    remove: 'Delete note', loading: 'Loading...', empty: 'No notes yet',
    emptyArchive: 'Archive is empty', notFound: 'Note not found',
    login: 'Login', register: 'Register', email: 'Email', password: 'Password', name: 'Name',
    confirmPassword: 'Confirm password', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    createAccount: 'Create account', loginTitle: 'Welcome back', registerTitle: 'Create a new account',
    theme: 'Theme', language: 'Language', light: 'Light', dark: 'Dark',
    brandName: 'Personal Notes', personalNotes: 'Personal Notes', brandSubtitle: 'A little space for your thoughts',
    archiveRoom: 'ARCHIVE ROOM', myNotes: 'MY NOTES',
    archiveHeadline: 'What you keep still matters.', notesHeadline: 'Save ideas. Clear your mind.',
    archiveDescription: 'A collection of notes you have archived.',
    notesDescription: 'A place for plans, daily stories, reflections, and ideas you want to remember.',
    archivedTag: 'Archived', noteTag: 'Note', readNote: 'Open note',
    notFoundSearch: 'No note found', tryAnotherKeyword: 'Try another keyword.',
    startWriting: 'Start writing something you want to keep.',
    archiveTag: 'Archive', privateNote: 'Private note',
    deleteConfirm: 'Delete this note?', processing: 'Processing...',
    newNoteEyebrow: 'NEW NOTE', writeFreely: 'Write freely', words: 'words',
    saving: 'Saving...', authentication: 'AUTHENTICATION',
    loginDescription: 'Log in to access your private notes.',
    createAccountEyebrow: 'CREATE ACCOUNT', registerDescription: 'Create an account to start saving notes.',
    passwordMismatch: 'Password confirmation does not match.',
    pageNotFound: 'This page does not exist yet.', tryAgain: 'Try again',
    createdBy: 'Created by',
    apiError: 'An error occurred while contacting the server.',
    errorTitle: 'Something went wrong',
  },
};

const apiMessageMap = {
  'Gagal melakukan registrasi': 'Registration failed',
  'Email sudah digunakan': 'Email is already registered',
  'User not found': 'User not found',
  'Invalid credentials': 'Invalid email or password',
  'Gagal melakukan login': 'Login failed',
  'Catatan tidak ditemukan': 'Note not found',
  'Gagal mendapatkan catatan': 'Failed to load notes',
  'Gagal menambahkan catatan': 'Failed to add note',
  'Gagal menghapus catatan': 'Failed to delete note',
  'Gagal mengarsipkan catatan': 'Failed to archive note',
  'Gagal mengeluarkan catatan dari arsip': 'Failed to unarchive note',
  'Terjadi kesalahan saat menghubungi server.': 'An error occurred while contacting the server.',
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved === 'en' ? 'en' : 'id';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'en' ? 'en' : 'id';
    document.title = language === 'en' ? 'Personal Notes' : 'Catatan Pribadi';
  }, [language]);

  const t = useMemo(() => (key) => translations[language][key] ?? key, [language]);

  const translateError = useMemo(() => (message) => {
    if (!message) return translations[language].apiError;
    if (language === 'id') return message;
    return apiMessageMap[message] || 'Something went wrong. Please try again.';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'id' ? 'en' : 'id'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translateError }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
