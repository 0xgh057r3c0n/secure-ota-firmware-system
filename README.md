# secure-ota-firmware-system
Logistics & IoT Edge — Secure OTA Firmware Update & Code Signing
![Example Image](example.png)

## 📌 Overview
This repository implements a secure, zero-trust Over-The-Air (OTA) firmware update system for distributed IoT fleets. It includes a FastAPI backend that signs firmware payloads and an administrative Next.js frontend for managing devices, firmware releases, and audit logs.

Key goals:
- Protect firmware integrity with SHA-256 hashing and asymmetric signatures.
- Provide authenticated administrative workflows for firmware release and device management.
- Maintain immutable audit trails for all security-sensitive actions.

---

## 🧩 Features (MVP)

- Cryptographic signing pipeline (`signing_service`) that computes SHA-256 fingerprints and produces signatures using the keys in the `keys/` folder.
- FastAPI backend with modular `routers/` for authentication, device registration, firmware ingestion, and auditing.
- Next.js administrative UI (in the `frontend` folder) to upload firmware, view devices, and inspect audit logs.

---

## 🚀 Quick start

Prerequisites:
- Python 3.10+ (backend)
- Node.js 18+ and npm (frontend)

Start backend (from repo root):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Start frontend (from `frontend`):

```bash
cd frontend
npm install
npm run dev
```

Notes:
- Keep the private key in `keys/private.pem` secret; do not commit changes to it.
- The backend uses a local SQLite file `backend/ota.db` for development.

---

## 📂 Repository layout

```
.
├── backend
│   ├── app
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   ├── audit.py
│   │   │   ├── device.py
│   │   │   ├── firmware.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── device.py
│   │   │   ├── firmware.py
│   │   │   └── logs.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── hash_service.py
│   │   │   └── signing_service.py
│   │   └── utils/
│   │       └── security.py
│   └── ota.db
├── frontend
│   ├── app/                # Next.js app directory (pages/components under app/)
│   ├── public/
│   ├── package.json
│   └── README.md
├── keys/
│   ├── private.pem
│   └── public.pem
├── requirements.txt
└── README.md
```

---

## 🗓️ Four-week roadmap (high level)

Week 1 — PKI & signing
- Provision dev RSA/ECDSA key pair in `keys/` and harden key handling.
- Implement and test `hash_service` + `signing_service` workflows.

Week 2 — Data & API
- Finalize SQLAlchemy models and migrations.
- Harden authentication and token flows in `routers/auth.py`.

Week 3 — Frontend & integration
- Finish core Next.js UI flows: login, firmware upload, device list, audit view.
- Connect UI to backend endpoints and validate signature verification on downloads.

### 🔒 Week 4: Verification, UI Integration & Rollback Protections
*   Connect the frontend components with the backend API to showcase dynamic tracking metrics, signature statuses, and active log collections.
*   Introduce monotonic system version logic to  ensure target edge devices cannot be forced to  downgrade to older, vulnerable firmware packages.
### 🔒 Week 4 — Verification & hardening
- Add monotonic version checks and rollback protection.
- Add end-to-end tests and update documentation.

---

## Security & contributing notes

- Do not commit `keys/private.pem`. Use environment-backed secret stores for production.
- Follow secure key rotation and least-privilege practices when integrating with build pipelines.

---

Thank you — contributions and issues are welcome.

