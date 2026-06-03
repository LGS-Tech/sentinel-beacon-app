// this protects web run from crashing
// exposqlite only for mobile, so web is mainly for testing ui, until proper backend created
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
let sqlite: any = null;



if (!isWeb) {

  const SQLite = require("expo-sqlite");
  sqlite = SQLite.openDatabaseSync("app.db") ;
}

export const db = {
  execSync: (...args: any[]) => {
    if (!sqlite) return;
    return sqlite.execSync(...args);
  },

  runSync: (...args: any[]) => {
    if (!sqlite) return;
    return sqlite.runSync(...args);
  },

  getFirstSync: (...args: any[]) => {
    if (!sqlite) return null;
    return sqlite.getFirstSync(...args);

  },

  

  getAllSync: (...args: any[]) => {
    if (!sqlite) return [];
    return sqlite.getAllSync(...args);
  },


  
};