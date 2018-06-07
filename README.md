# Skill Automation

## Install [MongoDB](https://www.mongodb.com)

After installing MongoDB, start the daemon process for the MongoDB system.

```bash
# !/usr/bin/env bash

mongod
```

Keep the process running while running the application locally.

## Environment Variables

- Vendor ID as **VENDOR_ID**
- DB as **DB_HOST**

Use dotenv to pass in environment variables to run locally:
`require('dotenv').config()`

Create `.env` file in the root directory of the project.

```bash
# .env file

# Vendor ID for Alexa Developer Portal
VENDOR_ID=M2LCJQMQ8K0T24

# Local MongoDB Database
DB_HOST=mongodb://localhost/skillAutomationdb
```

## Fix Installed Packages

```bash
# !/usr/bin/env bash

# To delete all installed packages
npm clean

# To delete and reinstall all packages
npm reinstall

```