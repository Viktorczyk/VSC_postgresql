# Implementacja Nowych Pól do Rezerwacji

## Podsumowanie Zmian

Dodałem do systemu rezerwacji trzy nowe pola:

1. **Całość** (`calosc`) - całkowita kwota do zapłaty za rezerwację
2. **Ilość osób** (`ilosc_osob`) - liczba osób uczestniczących w rezerwacji
3. **Pozostało do zapłaty** (`pozostalo_do_zaplaty`) - automatycznie obliczana kwota = calosc - zaliczka

## Kroki Wdrożenia

### 1. Aktualizacja Bazy Danych

Uruchom skrypt SQL `db_migration.sql` na bazie PostgreSQL:

```bash
psql -U <username> -d <database_name> -f db_migration.sql
```

Lub uruchom polecenia w konsoli PostgreSQL:

```sql
-- Dodaj kolumny do tabel apartamentów
ALTER TABLE public.apart1
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE public.apart2
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;

-- Opcjonalnie dla Jacuzzi
ALTER TABLE public.apart_jacuuzi
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;
```

### 2. Zmiany w Backend (index.js)

✅ Backend został automatycznie zaktualizowany:

- **POST /booking/ap1** - acceptuje nowe pola `calosc` i `ilosc_osob`
- **POST /booking/ap2** - acceptuje nowe pola `calosc` i `ilosc_osob`
- **GET /api/bookings** - zwraca nowe pola w odpowiedzi
- **POST /api/booking/ap1/update** - umożliwia edycję nowych pól
- **POST /api/booking/ap2/update** - umożliwia edycję nowych pól
- **POST /api/booking/jacuzzi/update** - umożliwia edycję nowych pól

#### Trigger dla Automatycznego Obliczania

Skrypt tworzy trigger `calculate_remaining_payment()`, który automatycznie oblicza:

```
pozostalo_do_zaplaty = calosc - amount_advance_payment
```

### 3. Zmiany w Frontend

#### Formularze Rezerwacji (ap1.html, ap2.html)

✅ Dodane nowe pola formularza:
- **Całość (kwota)** - pole numeryczne do wpisania całkowitej kwoty
- **Ilość osób** - pole numeryczne do wpisania liczby osób (minimum 1)

Pola znajdują się w sekcji formularza między EmailEM a Datami pobytu.

#### Szczegóły Rezerwacji (booking-details.html)

✅ Zaktualizowana strona wyświetlania:
- Wyświetla **Liczbę osób**
- Wyświetla **Całość do zapłaty**
- Wyświetla **Pozostało do zapłaty** (pod różnym kolorem w zależności od stanu)
- Edytor rezerwacji pozwala zmienić wszystkie nowe pola

## Jak Używać

### Tworzenie Rezerwacji

1. Użytkownik wypełnia formularz rezerwacji
2. Wprowadza:
   - Całość kwoty do zapłaty (np. 1500 PLN)
   - Ilość osób (np. 4)
   - Zaliczkę (opcjonalnie, np. 500 PLN)
3. Po wysłaniu formularz obliczysz:
   - Pozostało do zapłaty = 1500 - 500 = 1000 PLN

### Edycja Rezerwacji

1. Otwórz szczegóły rezerwacji
2. Kliknij "Edytuj"
3. Zmień pola (całość, ilość osób, itp.)
4. Kliknij "Zapisz zmiany"

### Wyświetlanie Rezerwacji

Na stronie szczegółów rezerwacji widoczne będą:
- ✓ Ilość osób: **X osób**
- ✓ Całość do zapłaty: **X PLN**
- ✓ Pozostało do zapłaty: **X PLN** (z kolorowaniem statusu)

## Wartości Domyślne

- `calosc`: 0 (można pozostawić puste)
- `ilosc_osob`: 1 osoba
- `pozostalo_do_zaplaty`: Automatycznie obliczane

## Techniczne Szczegóły

### Schemat Bazy Danych

```sql
ALTER TABLE public.apart1
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;
```

### Trigger PostgreSQL

Trigger `calculate_remaining_payment` uruchamia się przed INSERT lub UPDATE i automatycznie oblicza `pozostalo_do_zaplaty`.

## Testowanie

1. **Utwórz nową rezerwację** z wartościami:
   - Całość: 1000 PLN
   - Ilość: 2 osób
   - Zaliczka: 300 PLN

2. **Sprawdź szczegóły** - powinno pokazać:
   - Liczba osób: 2
   - Całość: 1000 PLN
   - Pozostało: 700 PLN

3. **Edytuj rezerwację** - zmień wartości i sprawdź czy się aktualizują

## Troubleshooting

Jeśli pola się nie wyświetlają:

1. Upewnij się, że baza danych została zaktualizowana (uruchomić migration)
2. Sprawdź konsolę przeglądarki pod kątem błędów JavaScript
3. Sprawdź logi serwera Node.js

Jeśli trigger nie działa:

1. Sprawdzić czy trigger został utworzony: `\df calculate_remaining_payment`
2. Sprawdzić czy trigger jest przypisany do tabel: `\dt+ apart1`

## Notatki

- Pole `pozostalo_do_zaplaty` jest **czytane** i **obliczane automatycznie**
- Backend zawsze preslicza tę wartość na podstawie wzoru
- Frontend też oblicza tę wartość do wyświetlania
- Wszystkie nowe pola mogą być puste (mają wartości domyślne)
