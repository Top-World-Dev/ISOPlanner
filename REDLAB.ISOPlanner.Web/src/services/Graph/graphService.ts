import CurrentUser from "../../models/currentuser";
import Tenant from "../../models/tenant";
import Group from "../../models/group";
import User from "../../models/user";
import Presence from "../../models/presence";
import { Client } from "@microsoft/microsoft-graph-client";
import { globalGraphMaxRecords } from "../../globalConstants";

function getAuthenticatedClient(accessToken: string) {
  const client = Client.init({
    // Use the provided access token to authenticate requests
    authProvider: (done: any) => {
      done(null, accessToken);
    },
  });

  return client;
}

export async function getUsers(accessToken: string, filterText: string, maxRecords: number = globalGraphMaxRecords): Promise<User[]> {
  const client = getAuthenticatedClient(accessToken);
  var userList = new Array<User>();

  const users = await client
    .api("/users")
    .filter(
      `startswith(displayName,'${filterText}') or startswith(givenName,'${filterText}') or startswith(surname,'${filterText}') or startswith(mail,'${filterText}') or startswith(userPrincipalName,'${filterText}') or startswith(jobTitle,'${filterText}')`
    )
    .select("id,mail,userPrincipalName,displayName,jobTitle")
    .top(maxRecords)
    .get();

  for (let i = 0; i < users.value.length; i++) {
    const user = users.value[i];
    var newuser = new User(user.id, user.mail || user.userPrincipalName, user.displayName);
    newuser.jobTitle = user.jobTitle;
    userList.push(newuser);
  }

  return userList;
}

export async function getGroups(accessToken: string): Promise<Group[]> {
  const client = getAuthenticatedClient(accessToken);
  var groupList = new Array<Group>();

  const groups = await client.api("/groups").select("id,mail,displayName").get();

  for (var group of groups) {
    groupList.push(new Group(group.id, group.name, group.mail));
  }

  return groupList;
}

export async function getUserDetails(accessToken: string) {

  try
  {
    const client = getAuthenticatedClient(accessToken);
    const me = await client.api("/me").select("id,displayName,mail,userPrincipalName,preferredLanguage,jobTitle").get();
    const org = await client.api("/organization").select("id,displayName").get();

    if (!org || !org.value[0] || !org.value[0].id || !org.value[0].displayName) {
      throw new Error("Cannot determine the organization of the user.")
    }
    
    const tenant = new Tenant(org.value[0].id, org.value[0].displayName);
    const user = new CurrentUser(me.id, tenant, me.displayName, me.mail || me.userPrincipalName, me.preferredLanguage);

    user.accountLanguageCode = me.preferredLanguage || '';
    user.jobTitle = me.jobTitle;

    try {
      const presence = await client.api("/me/presence").get();
      user.presence = new Presence(presence.availability);
  
      const me_mailbox = await client.api("/me").select("mailboxSettings").get();
  
      user.timeZone = me_mailbox.mailboxSettings.timeZone;
      user.timeFormat = me_mailbox.mailboxSettings.timeFormat;
    } catch (err) {
      // user probably has no mailbox
    }

    return user;

  }
  catch(err) {
    throw(err);
  }
}
