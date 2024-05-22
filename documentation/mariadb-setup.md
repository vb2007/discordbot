# Setting up MariaDB

## Disclaimer

**This isn't a complete MariaDB tutorial, I just show minimum required things you need to do for using MariaDB with the bot.**

You might want to look at other, more detailed guides.

## Installing MariaDB

If you run the bot on an Ubuntu / Debian Linux machiene, you can install MariaDB like that:

```shell
sudo apt install update
sudo apt install mariadb
```

If you use any other OS, please refer to the [original MariaDB documentation](https://mariadb.com/kb/en/getting-installing-and-upgrading-mariadb/)

Then go through the complete installation process with the following command. The steps should be clearly understandable.

```shell
sudo mysql_secure_installation
```

## Setting up privileges and creating the database

Open MariaDB as root:

```shell
sudo mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE discordbot;
```

Make a new user for accessing the database:

```sql
CREATE USER '<username>'@'localhost' IDENTIFIED BY '<password>';
```

Grant privileges to that user:

```sql
GRANT ALL ON discordbot.* to '<username>'@'%' IDENTIFIED BY '<password>' WITH GRANT OPTION;
```

Flush privileges:

```sql
FLUSH PRIVILEGES;
```

Then exit:

```sql
quit;
```

(Optional) If you want to keep MariaDB running in the background event after a reboot, enable it's systemd service with:

```shell
sudo systemctl enable mariadb
```

## Enbaling remote access to the database

*This step is optional. If you only want to user your database on localhost, skip this part.*

Open the following file with your preferred text editor:

```shell
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

Then enable remote access with modifying the ```bind-address = 127.0.0.1``` line to ```bind-address = 0.0.0.0```.

Restart MariaDB for the changes to take effect:

```shell
sudo systemctl restart mariadb
```

## Conclusion

If you're done with the installation, then you're ready to create the tables (as explained in the [original README file](../README.md)) and start using your databse.