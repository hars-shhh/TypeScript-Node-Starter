import acl = require("acl");
import mongoose = require("mongoose");
const ACL = new acl(new acl.mongodbBackend(mongoose.connection.db));
ACL.addRoleParents("root", "admin");
ACL.addRoleParents("admin", "user");
ACL.allow([
  {
    roles: ["admin"],
    allows: [{ resources: "/users", permissions: "get" }]
  },
  {
    roles: ["root"],
    allows: [{ resources: "/admins/index", permissions: "get" }]
  },
  {
    roles: ["guest"],
    allows: [{ resources: "", permissions: "get" }]
  }
]);
ACL.addRoleParents("user", "guest");
ACL.addRoleParents("admin", "user");
export { ACL };
export default ACL;
