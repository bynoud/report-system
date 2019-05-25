import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class ConfigService {
    // global setting is put here
    toogleSidebar = false;
    showFullDate = false;
    highlightNewUpdate = true;
}