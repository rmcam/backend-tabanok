ALTER TABLE unities ADD COLUMN "userId" uuid;
ALTER TABLE unities ADD CONSTRAINT "FK_unities_users" FOREIGN KEY ("userId") REFERENCES users("id");
