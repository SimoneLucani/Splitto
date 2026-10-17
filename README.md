# Splitto - Shared Expense Manager

Splitto is a web application inspired by the life of university students. It is designed to simplify the management of shared expenses among roommates or travel groups, reducing disputes and making cost division as straightforward as possible.

## Features
* **User Authentication:** Secure login and registration system.
* **Group Management:** Create new groups or join existing ones using a unique 6-character invite code.
* **Shopping List:** Add shared items to buy. Once purchased, users can log the cost and select which members to split it with.
* **Expenses:** Add, view, and track general shared payments (e.g., rent, utility bills).
* **Balances & Settlements:** View the current financial situation of the group. The system automatically calculates and suggests how to settle debts using the minimum number of transactions.

## How to Run
This project requires a local web server environment with PHP and a database. 
1. Download and install **XAMPP**.
2. Clone this repository into the `htdocs` folder of your XAMPP installation.
3. Start the Apache and MySQL modules from the XAMPP Control Panel.
4. Open your browser and navigate to `localhost/your_folder_name` to view the application.

## Test Accounts
The database is already populated with three test users belonging to a "Roommates" group (and two of them also share a "Holiday" group) to easily test the application's features.

**Credentials (Email / Password):**
* `sara@email.com` / `Sara2026?`
* `luca@email.com` / `Luca2026?`
* `ugo@email.com` / `Ugo2026?`

