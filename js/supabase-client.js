/* ==========================================================
   WEBSITE MASJID SYUKUR AMPEL - supabase-client.js
   Inisialisasi & Helper Klien Supabase (Auth + Sinkronisasi + Mutasi)
   ========================================================== */

(function (root) {
  'use strict';

  var SUPABASE_URL = 'https://awglyeokfvmihsubvnui.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_OoiqsG5sTiyyQTA6vRGnZw_mJq3QX0C';

  var client = null;
  if (typeof root.supabase !== 'undefined' && typeof root.supabase.createClient === 'function') {
    try {
      client = root.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (e) {
      console.warn('Gagal menginisialisasi client Supabase:', e);
    }
  } else {
    console.warn('Library Supabase JS belum dimuat dari CDN.');
  }

  // Objek Supabase Masjid
  var MasjidSupabase = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    client: client,

    // Cek status konektivitas
    isReady: function () {
      return Boolean(this.client);
    },

    /* ==========================================================
       1. AUTENTIKASI ADMIN (SUPABASE AUTH)
       ========================================================== */
    login: async function (email, password) {
      if (!this.client) return { success: false, message: 'Supabase client belum siap.' };
      try {
        var res = await this.client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (res.error) {
          return { success: false, message: res.error.message };
        }
        return { success: true, user: res.data.user, session: res.data.session };
      } catch (err) {
        return { success: false, message: err.message || 'Gagal login.' };
      }
    },

    logout: async function () {
      if (!this.client) return true;
      try {
        await this.client.auth.signOut();
        return true;
      } catch (err) {
        console.warn('Gagal logout Supabase:', err);
        return false;
      }
    },

    getUser: async function () {
      if (!this.client) return null;
      try {
        var res = await this.client.auth.getUser();
        return res.data ? res.data.user : null;
      } catch (e) {
        return null;
      }
    },

    /* ==========================================================
       2. SINKRONISASI DATA DARI SUPABASE KE LOCAL DATA STORE
       ========================================================== */
    syncToLocal: async function () {
      if (!this.client || typeof root.MasjidDB === 'undefined') return null;

      try {
        var results = await Promise.allSettled([
          this.client.from('masjid_info').select('*').limit(1),
          this.client.from('jadwal_salat').select('*').order('urutan', { ascending: true }),
          this.client.from('pengumuman').select('*').order('created_at', { ascending: false }),
          this.client.from('kegiatan').select('*').order('created_at', { ascending: false }),
          this.client.from('keuangan_periode').select('*').order('id', { ascending: false }),
          this.client.from('keuangan_transaksi').select('*').order('created_at', { ascending: true }),
          this.client.from('artikel').select('*').order('created_at', { ascending: false }),
          this.client.from('materi_kajian').select('*').order('created_at', { ascending: false }),
          this.client.from('rekening_donasi').select('*').order('urutan', { ascending: true }),
          this.client.from('takmir_anggota').select('*').order('urutan', { ascending: true }),
          this.client.from('galeri').select('*').order('created_at', { ascending: false }),
          this.client.from('pesan_jamaah').select('*').order('created_at', { ascending: false }).limit(200)
        ]);

        var db = root.MasjidDB.getAll();
        var hasUpdated = false;

        // 1. Info Masjid
        if (results[0].status === 'fulfilled' && results[0].value.data && results[0].value.data.length > 0) {
          var row = results[0].value.data[0];
          db.info = {
            nama: row.nama || db.info.nama,
            tagline: row.tagline || db.info.tagline,
            alamat: row.alamat || db.info.alamat,
            whatsapp: row.whatsapp || db.info.whatsapp,
            whatsappNumber: row.whatsapp_number || db.info.whatsappNumber,
            whatsappMalam: row.whatsapp_malam || db.info.whatsappMalam,
            whatsappMalamNumber: row.whatsapp_malam_number || db.info.whatsappMalamNumber,
            email: row.email || db.info.email,
            jamBuka: row.jam_buka || db.info.jamBuka,
            kapasitas: row.kapasitas || db.info.kapasitas,
            tahunBerdiri: row.tahun_berdiri || db.info.tahunBerdiri,
            fasilitas: row.fasilitas || db.info.fasilitas,
            sambutanKetua: row.sambutan_ketua || db.info.sambutanKetua,
            instagram: row.instagram || db.info.instagram,
            afiliasi: row.afiliasi || db.info.afiliasi,
            ciriKhas: row.ciri_khas || db.info.ciriKhas
          };
          hasUpdated = true;
        }

        // 2. Jadwal Salat
        if (results[1].status === 'fulfilled' && results[1].value.data && results[1].value.data.length > 0) {
          db.prayerTimes = results[1].value.data.map(function (p) {
            return {
              id: p.id,
              name: p.name,
              time: p.time,
              salat: Boolean(p.is_salat)
            };
          });
          hasUpdated = true;
        }

        // 3. Pengumuman
        if (results[2].status === 'fulfilled' && results[2].value.data && results[2].value.data.length > 0) {
          db.announcements = results[2].value.data.map(function (a) {
            return {
              id: a.id,
              date: a.date,
              day: a.day,
              month: a.month,
              tag: a.tag,
              isUrgent: Boolean(a.is_urgent),
              title: a.title,
              content: a.content,
              image: a.image || ''
            };
          });
          hasUpdated = true;
        }

        // 4. Kegiatan
        if (results[3].status === 'fulfilled' && results[3].value.data && results[3].value.data.length > 0) {
          db.activities = results[3].value.data.map(function (act) {
            return {
              id: act.id,
              title: act.title,
              category: act.category,
              categoryLabel: act.category_label || act.category,
              date: act.date,
              time: act.time,
              location: act.location,
              description: act.description || '',
              image: act.image || ''
            };
          });
          hasUpdated = true;
        }

        // 5 & 6. Laporan Keuangan (Periode + Transaksi)
        if (results[4].status === 'fulfilled' && results[4].value.data && results[4].value.data.length > 0) {
          var periodes = results[4].value.data;
          var transList = (results[5].status === 'fulfilled' && results[5].value.data) ? results[5].value.data : [];

          var financesObj = {};
          periodes.forEach(function (per) {
            var perTrx = transList.filter(function (t) { return t.periode_id === per.id; });
            var pemasukan = perTrx.filter(function (t) { return t.tipe === 'pemasukan'; }).map(function (t) {
              return { id: t.id, tgl: t.tgl, ket: t.ket, jumlah: Number(t.jumlah) || 0 };
            });
            var pengeluaran = perTrx.filter(function (t) { return t.tipe === 'pengeluaran'; }).map(function (t) {
              return { id: t.id, tgl: t.tgl, ket: t.ket, jumlah: Number(t.jumlah) || 0 };
            });

            financesObj[per.id] = {
              label: per.label,
              saldoAwal: Number(per.saldo_awal) || 0,
              pemasukan: pemasukan,
              pengeluaran: pengeluaran
            };
          });

          db.finances = financesObj;
          hasUpdated = true;
        }

        // 7. Artikel
        if (results[6].status === 'fulfilled' && results[6].value.data && results[6].value.data.length > 0) {
          db.articles = results[6].value.data.map(function (art) {
            return {
              id: art.id,
              title: art.title,
              category: art.category,
              categorySlug: art.category_slug,
              author: art.author,
              date: art.date,
              datetime: art.datetime,
              image: art.image || '',
              excerpt: art.excerpt || '',
              quoteArab: art.quote_arab || '',
              quoteTranslation: art.quote_translation || '',
              quoteSource: art.quote_source || '',
              fullText: art.full_text || '',
              downloadUrl: art.download_url || '',
              downloadLabel: art.download_label || '',
              downloadSize: art.download_size || '',
              videoUrl: art.video_url || ''
            };
          });
          hasUpdated = true;
        }

        // 8. Materi Kajian
        if (results[7].status === 'fulfilled' && results[7].value.data && results[7].value.data.length > 0) {
          db.materials = results[7].value.data.map(function (mat) {
            return {
              id: mat.id,
              activityId: mat.activity_id,
              title: mat.title,
              speaker: mat.speaker,
              date: mat.date,
              pdfUrl: mat.pdf_url || '#',
              pdfSize: mat.pdf_size || '1.0 MB',
              summary: mat.summary || ''
            };
          });
          hasUpdated = true;
        }

        // 9. Rekening Donasi
        if (results[8].status === 'fulfilled' && results[8].value.data && results[8].value.data.length > 0) {
          if (!db.donations) db.donations = {};
          db.donations.banks = results[8].value.data.map(function (b) {
            return {
              id: b.id,
              name: b.name,
              number: b.number,
              cleanNumber: b.clean_number,
              owner: b.owner,
              keterangan: b.keterangan || ''
            };
          });
          hasUpdated = true;
        }

        // 10. Struktur Takmir
        if (results[9].status === 'fulfilled' && results[9].value.data && results[9].value.data.length > 0) {
          if (!db.organization) db.organization = {};
          db.organization.members = results[9].value.data.map(function (m) {
            return {
              id: m.id,
              name: m.name,
              role: m.role,
              category: m.category,
              image: m.image || ''
            };
          });
          hasUpdated = true;
        }

        // 11. Galeri
        if (results[10].status === 'fulfilled' && results[10].value.data && results[10].value.data.length > 0) {
          db.gallery = results[10].value.data.map(function (g) {
            return {
              id: g.id,
              title: g.title,
              description: g.description || '',
              date: g.date,
              category: g.category,
              categoryLabel: g.category_label || g.category,
              image: g.image
            };
          });
          hasUpdated = true;
        }

        // 12. Pesan Jamaah
        if (results[11].status === 'fulfilled' && results[11].value.data) {
          db.messages = results[11].value.data.map(function (msg) {
            return {
              id: msg.id,
              nama: msg.nama,
              kontak: msg.kontak,
              tipe: msg.tipe || 'Pertanyaan',
              pesan: msg.pesan,
              dibaca: Boolean(msg.dibaca),
              created_at: msg.created_at || ''
            };
          });
          hasUpdated = true;
        }

        if (hasUpdated) {
          root.MasjidDB._saveRaw(db);
          root.dispatchEvent(new CustomEvent('masjid:data-synced', { detail: { source: 'supabase' } }));
        }

        return true;
      } catch (err) {
        console.warn('Sinkronisasi Supabase ke local selesai dengan catatan:', err);
        return false;
      }
    },

    /* ==========================================================
       3. OPERASI MUTASI DATA (ADMIN CREATE, UPDATE, DELETE)
       ========================================================== */
    // Info Masjid
    upsertInfo: async function (info) {
      if (!this.client) return null;
      try {
        var payload = {
          id: 'main',
          nama: info.nama,
          tagline: info.tagline,
          alamat: info.alamat,
          whatsapp: info.whatsapp,
          whatsapp_number: info.whatsappNumber,
          whatsapp_malam: info.whatsappMalam,
          whatsapp_malam_number: info.whatsappMalamNumber,
          email: info.email,
          jam_buka: info.jamBuka,
          kapasitas: info.kapasitas,
          tahun_berdiri: info.tahunBerdiri,
          fasilitas: info.fasilitas,
          sambutan_ketua: info.sambutanKetua,
          instagram: info.instagram,
          afiliasi: info.afiliasi,
          ciri_khas: info.ciriKhas,
          updated_at: new Date().toISOString()
        };
        return await this.client.from('masjid_info').upsert(payload);
      } catch (e) {
        console.error('Supabase upsertInfo error:', e);
      }
    },

    // Pengumuman
    insertAnnouncement: async function (ann) {
      if (!this.client) return null;
      try {
        return await this.client.from('pengumuman').insert([{
          id: ann.id,
          date: ann.date,
          day: ann.day,
          month: ann.month,
          tag: ann.tag,
          is_urgent: Boolean(ann.isUrgent),
          title: ann.title,
          content: ann.content,
          image: ann.image || ''
        }]);
      } catch (e) { console.error('insertAnnouncement error:', e); }
    },
    updateAnnouncement: async function (id, ann) {
      if (!this.client) return null;
      try {
        return await this.client.from('pengumuman').update({
          date: ann.date,
          day: ann.day,
          month: ann.month,
          tag: ann.tag,
          is_urgent: Boolean(ann.isUrgent),
          title: ann.title,
          content: ann.content,
          image: ann.image || ''
        }).eq('id', id);
      } catch (e) { console.error('updateAnnouncement error:', e); }
    },
    deleteAnnouncement: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('pengumuman').delete().eq('id', id);
      } catch (e) { console.error('deleteAnnouncement error:', e); }
    },

    // Kegiatan
    insertActivity: async function (act) {
      if (!this.client) return null;
      try {
        return await this.client.from('kegiatan').insert([{
          id: act.id,
          title: act.title,
          category: act.category,
          category_label: act.categoryLabel,
          date: act.date,
          time: act.time,
          location: act.location,
          description: act.description,
          image: act.image || ''
        }]);
      } catch (e) { console.error('insertActivity error:', e); }
    },
    updateActivity: async function (id, act) {
      if (!this.client) return null;
      try {
        return await this.client.from('kegiatan').update({
          title: act.title,
          category: act.category,
          category_label: act.categoryLabel,
          date: act.date,
          time: act.time,
          location: act.location,
          description: act.description,
          image: act.image || ''
        }).eq('id', id);
      } catch (e) { console.error('updateActivity error:', e); }
    },
    deleteActivity: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('kegiatan').delete().eq('id', id);
      } catch (e) { console.error('deleteActivity error:', e); }
    },

    // Artikel
    insertArticle: async function (art) {
      if (!this.client) return null;
      try {
        return await this.client.from('artikel').insert([{
          id: art.id,
          title: art.title,
          category: art.category,
          category_slug: art.categorySlug || 'artikel-islami',
          author: art.author,
          date: art.date,
          datetime: art.datetime || new Date().toISOString().substring(0, 10),
          image: art.image || '',
          excerpt: art.excerpt || '',
          quote_arab: art.quoteArab || '',
          quote_translation: art.quoteTranslation || '',
          quote_source: art.quoteSource || '',
          full_text: art.fullText || '',
          download_url: art.downloadUrl || '',
          download_label: art.downloadLabel || '',
          download_size: art.downloadSize || '',
          video_url: art.videoUrl || ''
        }]);
      } catch (e) { console.error('insertArticle error:', e); }
    },
    updateArticle: async function (id, art) {
      if (!this.client) return null;
      try {
        return await this.client.from('artikel').update({
          title: art.title,
          category: art.category,
          category_slug: art.categorySlug,
          author: art.author,
          date: art.date,
          datetime: art.datetime,
          image: art.image || '',
          excerpt: art.excerpt || '',
          quote_arab: art.quoteArab || '',
          quote_translation: art.quoteTranslation || '',
          quote_source: art.quoteSource || '',
          full_text: art.fullText || '',
          download_url: art.downloadUrl || '',
          download_label: art.downloadLabel || '',
          download_size: art.downloadSize || '',
          video_url: art.videoUrl || ''
        }).eq('id', id);
      } catch (e) { console.error('updateArticle error:', e); }
    },
    deleteArticle: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('artikel').delete().eq('id', id);
      } catch (e) { console.error('deleteArticle error:', e); }
    },

    // Galeri
    insertGallery: async function (g) {
      if (!this.client) return null;
      try {
        return await this.client.from('galeri').insert([{
          id: g.id,
          title: g.title,
          description: g.description,
          date: g.date || new Date().toISOString().substring(0, 10),
          category: g.category,
          category_label: g.categoryLabel,
          image: g.image
        }]);
      } catch (e) { console.error('insertGallery error:', e); }
    },
    updateGallery: async function (id, g) {
      if (!this.client) return null;
      try {
        return await this.client.from('galeri').update({
          title: g.title,
          description: g.description,
          date: g.date,
          category: g.category,
          category_label: g.categoryLabel,
          image: g.image
        }).eq('id', id);
      } catch (e) { console.error('updateGallery error:', e); }
    },
    deleteGallery: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('galeri').delete().eq('id', id);
      } catch (e) { console.error('deleteGallery error:', e); }
    },

    // Materi Kajian (PDF)
    insertMaterial: async function (mat) {
      if (!this.client) return null;
      try {
        return await this.client.from('materi_kajian').insert([{
          id: mat.id,
          activity_id: mat.activityId,
          title: mat.title,
          speaker: mat.speaker,
          date: mat.date,
          pdf_url: mat.pdfUrl || '#',
          pdf_size: mat.pdfSize || '1.0 MB',
          summary: mat.summary
        }]);
      } catch (e) { console.error('insertMaterial error:', e); }
    },
    updateMaterial: async function (id, mat) {
      if (!this.client) return null;
      try {
        return await this.client.from('materi_kajian').update({
          activity_id: mat.activityId,
          title: mat.title,
          speaker: mat.speaker,
          date: mat.date,
          pdf_url: mat.pdfUrl || '#',
          pdf_size: mat.pdfSize || '1.0 MB',
          summary: mat.summary
        }).eq('id', id);
      } catch (e) { console.error('updateMaterial error:', e); }
    },
    deleteMaterial: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('materi_kajian').delete().eq('id', id);
      } catch (e) { console.error('deleteMaterial error:', e); }
    },

    // Keuangan: Periode & Transaksi
    upsertFinancePeriod: async function (periodKey, data) {
      if (!this.client) return null;
      try {
        return await this.client.from('keuangan_periode').upsert({
          id: periodKey,
          label: data.label,
          saldo_awal: Number(data.saldoAwal) || 0
        });
      } catch (e) { console.error('upsertFinancePeriod error:', e); }
    },
    deleteFinancePeriod: async function (periodKey) {
      if (!this.client) return null;
      try {
        return await this.client.from('keuangan_periode').delete().eq('id', periodKey);
      } catch (e) { console.error('deleteFinancePeriod error:', e); }
    },
    insertFinanceTransaction: async function (periodKey, type, item) {
      if (!this.client) return null;
      try {
        return await this.client.from('keuangan_transaksi').insert([{
          id: item.id,
          periode_id: periodKey,
          tipe: type,
          tgl: item.tgl,
          ket: item.ket,
          jumlah: Number(item.jumlah) || 0
        }]);
      } catch (e) { console.error('insertFinanceTransaction error:', e); }
    },
    deleteFinanceTransaction: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('keuangan_transaksi').delete().eq('id', id);
      } catch (e) { console.error('deleteFinanceTransaction error:', e); }
    },

    // Takmir Anggota
    insertMember: async function (m) {
      if (!this.client) return null;
      try {
        return await this.client.from('takmir_anggota').insert([{
          id: m.id,
          name: m.name,
          role: m.role,
          category: m.category,
          image: m.image || '',
          urutan: m.urutan || 0
        }]);
      } catch (e) { console.error('insertMember error:', e); }
    },
    updateMember: async function (id, m) {
      if (!this.client) return null;
      try {
        return await this.client.from('takmir_anggota').update({
          name: m.name,
          role: m.role,
          category: m.category,
          image: m.image || ''
        }).eq('id', id);
      } catch (e) { console.error('updateMember error:', e); }
    },
    deleteMember: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('takmir_anggota').delete().eq('id', id);
      } catch (e) { console.error('deleteMember error:', e); }
    },

    // Pesan Jamaah
    sendMessage: async function (payload) {
      if (!this.client) return null;
      try {
        return await this.client.from('pesan_jamaah').insert([{
          nama: payload.nama,
          kontak: payload.kontak,
          tipe: payload.tipe || 'Pertanyaan',
          pesan: payload.pesan,
          dibaca: false
        }]);
      } catch (e) {
        console.error('Gagal mengirim pesan ke Supabase:', e);
        return null;
      }
    },
    markMessageRead: async function (id, isRead) {
      if (!this.client) return null;
      try {
        return await this.client.from('pesan_jamaah').update({ dibaca: isRead !== false }).eq('id', id);
      } catch (e) { console.error('markMessageRead error:', e); }
    },
    deleteMessage: async function (id) {
      if (!this.client) return null;
      try {
        return await this.client.from('pesan_jamaah').delete().eq('id', id);
      } catch (e) { console.error('deleteMessage error:', e); }
    },

    /* ==========================================================
       4. OPERASI STORAGE (UPLOAD FILE MEDIA / GAMBAR / PDF)
       ========================================================== */
    uploadMedia: async function (fileOrBlob, folder, customFilename) {
      if (!this.client) {
        return { success: false, message: 'Supabase client belum siap.' };
      }

      var BUCKET = 'masjid-media';
      folder = folder || 'uploads';

      try {
        // Tentukan ekstensi
        var ext = 'jpg';
        if (fileOrBlob.type === 'application/pdf') {
          ext = 'pdf';
        } else if (fileOrBlob.type === 'image/png') {
          ext = 'png';
        } else if (fileOrBlob.type === 'image/webp') {
          ext = 'webp';
        } else if (fileOrBlob.name) {
          var dotIdx = fileOrBlob.name.lastIndexOf('.');
          if (dotIdx !== -1) {
            ext = fileOrBlob.name.substring(dotIdx + 1).toLowerCase();
          }
        }

        // Tentukan nama file unik
        var cleanName = (customFilename || ('file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8))) + '.' + ext;
        var filePath = folder + '/' + cleanName;

        var res = await this.client.storage
          .from(BUCKET)
          .upload(filePath, fileOrBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: fileOrBlob.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg')
          });

        if (res.error) {
          console.error('Gagal upload ke Supabase Storage:', res.error);
          return { success: false, message: res.error.message };
        }

        // Dapatkan URL publik
        var pubRes = this.client.storage.from(BUCKET).getPublicUrl(filePath);
        var publicUrl = pubRes && pubRes.data ? pubRes.data.publicUrl : '';

        return {
          success: true,
          path: filePath,
          publicUrl: publicUrl
        };
      } catch (err) {
        console.error('Error saat upload file:', err);
        return { success: false, message: err.message || 'Gagal mengunggah file.' };
      }
    },

    // Helper konversi data URL Base64 ke Blob
    dataUrlToBlob: function (dataUrl) {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
        return null;
      }
      try {
        var arr = dataUrl.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      } catch (e) {
        console.error('Gagal konversi dataURL ke Blob:', e);
        return null;
      }
    }
  };

  root.MasjidSupabase = MasjidSupabase;

  // Jalankan sinkronisasi awal saat browser siap
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        if (root.MasjidSupabase && root.MasjidSupabase.isReady()) {
          root.MasjidSupabase.syncToLocal();
        }
      }, 50);
    });
  }

})(typeof window !== 'undefined' ? window : this);
