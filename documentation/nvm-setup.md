# Running on the correct Node.js version

To ensure your Discord bot runs on the correct version of Node.js, you can use Node Version Manager (nvm). Follow these steps to set up nvm and switch to the required Node.js version.

> [!WARN]
> Currently, only `v24.8.0` is officially supported. Using other versions can work, but may lead to unexpected issues.

## Installing & activating nvm

If you don't have nvm installed, you can install it by running the following command in your terminal:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

You might need to restart your terminal to use nvm or use this command (replace if using different shell):

```bash
source ~/.bashrc
```

Finally, install the relevant version of Node.js and set it as default:

```bash
nvm install 24.8.0
```

```bash
nvm alias default 24.8.0
```

You can verify that the correct version is active by running:

```bash
node -v
```
