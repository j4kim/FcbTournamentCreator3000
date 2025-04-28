# FCB Tournament Creator 3000

## Create passwords for megarobust security

```
php -r 'echo password_hash("sandwich", PASSWORD_DEFAULT);' > pwd.editor
php -r 'echo password_hash("fromage", PASSWORD_DEFAULT);' > pwd.admin
```

## Run locally

```
php -S localhost:1234
```

Type <kbd>Ctrl</kbd> + <kbd>E</kbd> to enter editor or admin mode.
