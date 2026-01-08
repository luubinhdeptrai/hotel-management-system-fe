API reference: https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/api-docs/ or html file in this folder

## I Reservation

1. Create a new customer (if not exist) to reservation via POST /employee/customers

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "password": "password123",
  "email": "nguyenvana@example.com",
  "idNumber": "001234567890",
  "address": "123 Đường Lê Lợi, Quận 1, TP.HCM"
}
```

2. Create reservation via POST /employee/bookings

```json
{
  "customerId": "string",
  "customer": {
    "fullName": "string",
    "phone": "string",
    "email": "string",
    "idNumber": "string",
    "address": "string"
  },
  "rooms": [
    {
      "roomTypeId": "string",
      "count": 0
    }
  ],
  "checkInDate": "2026-01-05T05:59:06.635Z",
  "checkOutDate": "2026-01-05T05:59:06.635Z",
  "totalGuests": 0
}
```

3. Pay upfront deposit via POST /employee/transactions

full payment

```json
{
  "bookingId": "booking_123",
  "paymentMethod": "CASH",
  "transactionType": "DEPOSIT"
}
```

split room payment

```json
{
  "bookingId": "booking_123",
  "bookingRoomIds": ["room_1", "room_2"],
  "paymentMethod": "CREDIT_CARD",
  "transactionType": "ROOM_CHARGE"
}
```

payment with promotion code

```json
{
{
  "bookingId": "booking_123",
  "paymentMethod": "CASH",
  "transactionType": "DEPOSIT",
  "promotionApplications": [
    {
      "customerPromotionId": "cp_123",
      "bookingRoomId": "room_1"
    }
  ]
}
```

3.1 Can create many deposits for the same 'booking'. When the upfront deposit of that booking is paid ENOUGH, the booking status will be updated to "CONFIRMED"

**Notes: a single user can reservate many rooms in a single 'booking'**

## II Check-in

1. Create customer (if not exist) to check in via POST /employee/customers

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "password": "password123",
  "email": "nguyenvana@example.com",
  "idNumber": "001234567890",
  "address": "123 Đường Lê Lợi, Quận 1, TP.HCM"
}
```

2. Check-in via POST /employee/bookings/check-in (can check-in many rooms in a single 'booking')

```json
{
  "checkInInfo": [
    {
      "bookingRoomId": "booking_room_id_1",
      "customerIds": ["customer_id_1", "customer_id_2"]
    },
    {
      "bookingRoomId": "booking_room_id_2",
      "customerIds": ["customer_id_3"]
    }
  ]
}
```

## III Use services (if any)

this will get updated later

## IV Check-out

1. Pays all remaining balance via POST /employee/transactions

2. Check-out via POST /employee/bookings/check-out (can check-out many rooms at a same time)

```json
{
  "bookingRoomIds": ["booking_room_id_1", "booking_room_id_2"]
}
```
