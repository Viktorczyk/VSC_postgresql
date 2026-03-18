# System Rezerwacji Apartamentów

Aplikacja web do zarezerwowania apartamentów z systemem logowania i bazą danych PostgreSQL.

## 🔧 Instalacja i Konfiguracja

### 1. Wymagania
- Node.js (v14+)
- PostgreSQL (uruchomiony lokalnie)

### 2. Instalacja pakietów
```bash
npm install
```

Zostały zainstalowane:
- `express` - framework web
- `pg` - driver PostgreSQL
- `dotenv` - zarządzanie zmiennymi srodowiskowymi
- `express-session` - zarządzanie sesjami użytkownika

### 3. Konfiguracja bazy danych

#### a) Utwórz bazę danych
```sql
CREATE DATABASE "DBLocal";
```

#### b) Utwórz tabelę użytkowników

Uruchom plik `setup_users.sql` w pgAdmin lub CLI PostgreSQL:

```bashpsql -U postgres -h localhost -d DBLocal -f setup_users.sql
```

Lub ręcznie w pgAdmin:
1. Otwórz pgAdmin
2. Podłącz do swojej bazy danych
3. Skopiuj zawartość `setup_users.sql` i uruchom jako zapytanie

#### c) Utwórz tabele rezerwacji (jeśli nie istnieją)

```sql
CREATE TABLE IF NOT EXISTS public.booking_ap1 (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_from DATE,
  date_to DATE,
  deposit BOOLEAN,
  jacuzzi BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.booking_ap2 (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_from DATE,
  date_to DATE,
  deposit BOOLEAN,
  jacuzzi BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.booking_jacuuzi (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  date DATE,
  time VARCHAR(50),
  hours INT
);
```

### 4. Zmienne środowiskowe

Sprawdzź plik `.env`:
```
PORT=3000
DATABASE_URL=postgres://postgres:masterkey@localhost:5432/DBLocal
```

Zmień dane dostępowe podle Twojej konfiguracji PostgreSQL.

---

## 🚀 Uruchomienie

```bash
npm start
```

Serwer będzie dostępny pod adresem: **http://localhost:3000**

---

## 📱 Użytkowanie

### Proces logowania
1. Otwórz http://localhost:3000
2. Zostaniesz automatycznie przekierowany na stronę logowania
3. Zaloguj się za pomocą danych testowych:
   - **Email:** test@example.com
   - **Hasło:** password123

### Dostępne opcje
Po zalogowaniu:
1. **Wybór apartamentu** - Strona z listą dostępnych apartamentów
2. **Formularz rezerwacji** - Wypełnij dane i daty rezerwacji
3. **Sprawdzenie jacuzzi** - Sistema automatycznie sprawdza dostępność
4. **Wylogowanie** - Przycisk w górnym prawym przedzie każdej strony

---

## 👥 Testowe konta

| Email | Hasło | Nazwa |
|-------|-------|-------|
| test@example.com | password123 | Test User |
| admin@example.com | admin123 | Administrator |
| jan@example.com | jan123 | Jan Kowalski |

---

## 📁 Struktura pliku

```
.vscode/
├── index.js                 # Serwer Express (główny plik)
├── login.html              # Strona logowania
├── index.html              # Strona główna (redirect)
├── bookings_choose.html    # Wybór apartamentu
├── ap1.html                # Formularz rezerwacji Apartament 1
├── ap2.html                # Formularz rezerwacji Apartament 2
└── styles.css              # Style CSS

setup_users.sql            # Skrypt SQL do stworzenia tabeli users
.env                       # Zmienne środowiskowe
```

---

## 🛡️ Bezpieczeństwo

⚠️ **Ważne!** W produkcji:
- Zmień `secret` w `express-session` na losowy, silny klucz
- Użyj `bcrypt` do hashowania haseł (zamiast przechowywania w postaci tekstowej)
- Wdrożyć HTTPS
- Ustawić `secure: true` na cookies sesji
- Zmienić hasła testowe

---

## 🐛 Troubleshooting

### Błąd: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL nie jest uruchomiony
- Sprawdź, czy serwis PostgreSQL jest włączony

### Błąd: "database does not exist"
- Utwórz bazę danych `DBLocal`
- Uruchom skrypt `setup_users.sql`

### Błąd logowania
- Sprawdzź, czy tabela `users` istnieje w bazie
- Zweryfikuj dane w `.env`

---

## 📋 Endpointy API

| Metoda | URL | Opis |
|--------|-----|------|
| GET | `/` | Strona główna (redirect na login lub rezerwacje) |
| GET | `/login.html` | Strona logowania |
| POST | `/api/login` | Logowanie użytkownika |
| GET | `/api/logout` | Wylogowanie |
| GET | `/api/user` | Sprawdzenie statusu logowania |
| GET | `/bookings/choose` | Wybór apartamentu (wymagane logowanie) |
| GET | `/booking/ap1/form` | Formularz rezerwacji AP1 (wymagane logowanie) |
| GET | `/booking/ap2/form` | Formularz rezerwacji AP2 (wymagane logowanie) |
| POST | `/booking/ap1` | Subicja rezerwacji AP1 |
| POST | `/booking/ap2` | Subicja rezerwacji AP2 |
| GET | `/booking/jacuuzi/check` | Sprawdzenie dostępności jacuzzi |

---

## 📝 Uwagi

- Sesje użytkownika są przechowywane w pamięci (dla produkcji używaj `connect-pg-simple` lub `redis`)
- Haszze haseł są przechowywane w tekście (dla produkcji używaj `bcrypt`)
- System automatycznie sprawdza dostępność jacuzzi na podstawie wybranych dat

---

Powodzenia! 🎉
