import { EventEmitter } from "events";

const notificationService = new EventEmitter();

notificationService.on("user:registered", (user) => {
  console.log(`New user registered: ${user.email}`);
});

notificationService.on("user:verified", (user) => {
  console.log(`User verified: ${user.email}`);
});

notificationService.on("user:invited", (user) => {
  console.log(`User invited: ${user.email}`);
});

notificationService.on("user:deleted", (user) => {
  console.log(`User deleted: ${user.email}`);
});

export default notificationService;
