# Setup Bazy Danych - Automtyczne Tworzenie Tabel

## 🎯 Co się zmienia?

Baza danych będzie teraz **automatycznie tworzyć wszystkie tabele** przy każdym starcie aplikacji:

- ✅ Tabele są **tworzone jeśli nie istnieją** (CREATE TABLE IF NOT EXISTS)
- ✅ **Triggery** automatycznie obliczają pola (pozostalo_do_zaplaty)
- ✅ **Nie trzeba ręcznie** wdrażać żadnych skryptów SQL
- ✅ Aplikacja sama się inicjalizuje

## 🚀 Jak Uruchomić

### Opcja 1: Normalne uruchomienie (z automtycznym setupem)
```bash
npm run dev
```
To uruchomi:
1. Setup bazy danych (`setup-db.js`)
2. Aplikację (`index.js`)

### Opcja 2: Tylko setup bazy danych
```bash
npm run setup-db
```
Tylko tworzy tabele, nie uruchamia aplikacji.

### Opcja 3: Normalne uruchomienie (setup występuje przy starcie)
```bash
npm start
```
Setup tabel również się odbywa (zintegrowane w `index.js`).

## 📋 Co Zostanie Utworzone

### Tabele:
1. **public.users** - użytkownicy (email, hasło, nazwa)
2. **public.apart1** - rezerwacje apartamentu 1
3. **public.apart2** - rezerwacje apartamentu 2
4. **public.apart_jacuuzi** - rezerwacje jacuzzi (z constraintami)
5. **public.test1** - tabela testowa
6. **public.booking_jacuuzi** - legacy tabela jacuzzi

### Pola Rezerwacji (apart1, apart2, apart_jacuuzi):
```
- id (PRIMARY KEY)
- email, name, surname
- date_form, date_to (daty rezerwacji)
- is_jacuzzi (boolean)
- is_advance_payment (boolean)
- amount_advance_payment (zaliczka)
- currency (PLN/EUR/USD)
- calosc (całość kwoty) - NOWE
- ilosc_osob (ilość osób) - NOWE
- pozostalo_do_zaplaty (auto-obliczane) - NOWE
- created_at (timestamp)
```

### Triggery:
```
calculate_remaining_payment() - automatycznie oblicza:
  pozostalo_do_zaplaty = calosc - amount_advance_payment
```

## 🔄 Jak To Działa

```
npm start / npm run dev
    ↓
Pool PostgreSQL się łączy
    ↓
initializeDatabase() się uruchamia
    ↓
Tworzy wszystkie tabele (jeśli ich brak)
    ↓
Tworzy triggery
    ↓
Aplikacja jest gotowa
```

## ✨ Zalety

- 🚀 **Zero Setup** - aplikacja sama robi wszystko
- 🔁 **Idempotent** - można uruchamiać wielokrotnie, beziecznie
- 📊 **Kompletne** - wszystkie tabele i triggery w jednym miejscu
- 🎯 **Automatyczne** - nie trzeba pamiętać o ręcznych migracjach

## 📝 Notatka

Jeśli tabela już istnieje, script jej nie nadpisze - użyje ją taką jaka jest. 
Jedynie triggery są zawsze odtwarzane (DROP i CREATE na nowo).

## 🛠️ Troubleshooting

Jeśli coś pójdzie nie tak:

1. **Sprawdź .env** - czy `DATABASE_URL` jest poprawny?
   ```bash
   echo $env:DATABASE_URL  # Windows PowerShell
   echo $DATABASE_URL      # Linux/Mac
   ```

2. **Uruchom ręcznie setup**:
   ```bash
   npm run setup-db
   ```

3. **Sprawdź logi** - powinny być w konsoli ze statusami ✓

4. **Sprawdź połączenie do bazy**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

## 📋 Pliki Zmieniane

- `.vscode/index.js` - Zaktualizowana funkcja `initializeDatabase()`
- `.vscode/setup-db.js` - NOWY script dla ręcznego setupu
- `package.json` - Dodane skrypty `setup-db` i `dev`

Gotowe! 🎉
