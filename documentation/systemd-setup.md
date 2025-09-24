# Running the app in the background as a systemd service

If you're using any Linux server, you can follow this guide to run the application as a systemd service.

## Setup steps

> [!WARN]
> Before running the application, make sure you're using a supported Node.js version (see [nvm-setup.md](nvm-setup.md)).

Make a new service called `discordbot.service` in the `/etc/systemd/system` folder based on [THIS](../systemd/discordbot.service) example file:

```shell
sudo nano /etc/systemd/system/discordbot.sevice
```

Edit the relevant lines in the file (you can leave the rest as-is), then save the changes:

> [!TIP]
> You can find out your node path with `which node` command.

```service
...
Environment="PATH=/home/your-user/.nvm/versions/node/v24.8.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
...
User=your-user
Group=your-group
WorkingDirectory=/path/to/the/projects/folder
ExecStartPre=/bin/mkdir -p /path/to/the/projects/folder/temp
ExecStartPre=/bin/chmod -R 777 /path/to/the/projects/folder/temp
...
```

Reload systemd:

```shell
sudo systemctl daemon-reload
```

Start the service:

```shell
sudo systemctl start discordbot.service
```

(Optional) Enable the service to start on boot:

```shell
sudo systemctl enable discordbot.service
```

## Management, monitoring

You can check the app's status with:

```shell
sudo systemctl status discordbot.service
```

You can check the app's error logs with:

```shell
sudo journalctl -u discordbot.service
```

You can stop the service with:

```shell
sudo systemctl stop discordbot.service
```

You can disable (stop starting on boot) the service with:

```shell
sudo systemctl disable discordbot.service
```
