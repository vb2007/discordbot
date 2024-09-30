# Running the app in the background as a systemd service

If you're using any Linux server, you can follow this guide to run the application as a systemd service.

## Setup steps

Make a new service called `discordbot.service` in the `/etc/systemd/system` folder based on [THIS](../systemd/discordbot.service) example file:

```shell
sudo nano /etc/systemd/system/discordbot.sevice
```

Edit the relevant lines in the file (you can leave the rest as-is), then save the changes:

```service
...
WorkingDirectory=/path/to/the/projects/folder
...
User=your-user
Group=your-group
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