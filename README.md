# secure-ota-firmware-system
Logistics & IoT Edge - Secure OTA Firmware Update & Code Signing Infrastructure
![Example Image](example.png)

## 📌 Project Overview & Executive Problem Statement
Supply chain and logistics companies rely heavily on distributed fleets of IoT tracking devices to monitor valuable cargo in transit. However, deploying software updates to these remote edge endpoints introduces a critical security vulnerability. If a malicious actor intercepts an Over-the-Air (OTA) update and pushes a compromised binary, they can hijack the entire fleet. 

The objective of this project is to architect a highly secure, zero-trust OTA Firmware Update framework. This repository implements a high-performance **FastAPI backend REST API** paired with an intuitive **Frontend administrative dashboard** to handle user authorization, device tracking, security audit trails, and automated cryptographic signing of firmware updates before fleet distribution.

---

## 🛠️ Minimum Viable Product (MVP) Specifications

1.  **Cryptographic Signing Pipeline:** Orchestrated by an internal backend `signing_service`. Asymmetric cryptographic keys stored inside `/keys` are securely processed to compute the firmware's SHA-256 footprint and generate a binding digital signature.
2.  **Robust FastAPI API Routing:** Implements dedicated modular controllers (`routers/`) to isolate logic workflows, including user authentication, device state registration, firmware metadata management, and systematic security auditing.
3.  **Administrative UI Management Control:** A clean dashboard providing operational visibility over firmware version increments, live device telemetry, and security failure audit maps.

---

## 📂 Project Directory Structure

```text
.
├── backend
│   ├── app
│   │   ├── config.py             # Application environment and settings configuration
│   │   ├── database.py           # SQLite database engine connection setup
│   │   ├── main.py               # Core FastAPI application entrypoint
│   │   ├── models/               # SQLAlchemy ORM database layer definitions
│   │   │   ├── audit.py          # Security event and trail logging schema
│   │   │   ├── device.py         # Fleet tracker device registry schema
│   │   │   ├── firmware.py       # Firmware binary metadata schema
│   │   │   └── user.py           # Authentication profile schema
│   │   ├── routers/              # Modular endpoint API controller layers
│   │   │   ├── auth.py           # Login, token generation, and verification routes
│   │   │   ├── device.py         # Fleet tracker telemetry and check-in endpoints
│   │   │   └── firmware.py       # Ingestion, signing triggers, and download endpoints
│   │   ├── schemas/              # Pydantic data validation and parsing layers
│   │   │   └── auth.py           # User credential serialization models
│   │   ├── services/             # Core internal system logic layers
│   │   │   ├── hash_service.py   # Baseline payload SHA-256 verification utilities
│   │   │   └── signing_service.py# Private-key signature generation modules
│   │   └── utils/                # Auxiliary global security functions
│   │       └── security.py       # Password hashing and token validation logic
│   └── ota.db                    # Active relational local database file
├── frontend                      # Administrative UI management dashboard
│   ├── public/                   # Static browser assets (favicons, manifest files)
│   ├── src/                      # Core frontend application source
│   │   ├── assets/               # Local styles, images, and branding elements
│   │   ├── components/           # Reusable UI widgets (cards, navigation blocks)
│   │   │   ├── AuditLogs.jsx     # Visual data table displaying security history logs
│   │   │   ├── DeviceTable.jsx   # Interactive listing of tracked fleet units
│   │   │   └── FirmwareForm.jsx  # File uploader mechanism for fresh binaries
│   │   ├── pages/                # View screens mapping out frontend router targets
│   │   │   ├── Dashboard.jsx     # Primary control hub aggregating telemetry data
│   │   │   └── Login.jsx         # Administrative secure portal interface entry
│   │   ├── services/             # Abstracted infrastructure communications layer
│   │   │   └── api.js            # Axios/Fetch utility endpoints targeting the backend
│   │   ├── App.jsx               # Root frontend UI initialization engine
│   │   └── main.jsx              # Framework lifecycle bootstrap mounting target
│   ├── package.json              # UI project dependency manifest
│   └── vite.config.js            # Frontend compilation build orchestrator
├── keys/
│   ├── private.pem               # Asymmetric private key asset (Keep Secure!)
│   └── public.pem                # Asymmetric public verification certificate
├── LICENSE                       # Project distribution license file
├── README.md                     # Current project documentation manifest
└── requirements.txt              # Core backend dependencies configuration list
```

---

## 🗓️ Four-Week Engineering Roadmap

### 📦 Week 1: PKI Setup and Cryptographic Hashing
*   Establish the baseline Public Key Infrastructure (PKI) by provisioning asymmetric pairs (`private.pem` and `public.pem`).
*   Build out core backend services (`hash_service.py` and `signing_service.py`) to generate SHA-256 cryptographic fingerprints and handle binary signature math.

### 🚀 Week 2: Database Layer & API Architecture
*   Design relational data schemas (`models/`) for tracking system users, device registration arrays, firmware versions, and immutable security audit logs.
*   Configure the local database engine (`database.py`) using SQLite (`ota.db`) to track system states securely.

### 🛡️ Week 3: Secure REST Endpoints & UI Scaffolding
*   Implement modular routing blocks (`routers/`) to process edge device handshakes and firmware ingestion streams securely.
*   Scaffold the frontend component framework and implement the login view along with core dashboard layouts.

### 🔒 Week 4: Verification, UI Integration & Rollback Protections
*   Connect the frontend components with the backend API to showcase dynamic tracking metrics, signature statuses, and active log collections.
*   Introduce monotonic system version logic to ensure target edge devices cannot be forced to downgrade to older, vulnerable firmware packages.

---

## 🚦 Infotact Mandatory Git & Verification Standards

To pass evaluation, the development workflow must strictly adhere to the following enterprise-grade protocols:

1.  **Continuous Git Contribution:** Compressed histories or massive monolithic pushes during the final week will result in immediate disqualification. Commits must be distributed evenly across all 4 weeks to show daily debugging and architectural effort.
2.  **Semantic, Present-Tense Commit Messaging:** Commits must use granular wrappers and semantic prefixes (e.g., `feat: implement signing service` or `fix: resolve dashboard rendering crash`).
3.  **Kanban Project Board Mapping:** The 4-week roadmap must be tracked explicitly via GitHub Issues linked to your Projects tab. Every commit must reference the explicit issue ID it acts upon (e.g., `fixes #1`).
4.  **Strict Branching Isolation:** Commits straight to `main` or `master` are forbidden. All mechanics must be built out on separate feature branches and merged into production using detailed Pull Requests.
5.  **Zero Key Leaks:** Hardcoding private keys, access tokens, or connection parameters inside files is grounds for immediate failure. Utilize secure Environment Variables and local configuration parameters exclusively.
