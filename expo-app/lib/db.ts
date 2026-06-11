// manages the temp database, stops from loading in the web as its not supported
import { Platform } from "react-native";



const isWeb = Platform.OS === "web";

let sqlite: any = null;

if (!isWeb) {

  try {
    const SQLite = eval("require")("expo-sqlite");
    sqlite = SQLite.openDatabaseSync("app.db");
  } catch (error) {
    
    console.log("SQLite unavailable", error);
  }
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