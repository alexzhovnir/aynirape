import { Module } from "@medusajs/framework/utils";
import ContactModuleService from "./service";

export default Module("contact", {
  service: ContactModuleService,
});
