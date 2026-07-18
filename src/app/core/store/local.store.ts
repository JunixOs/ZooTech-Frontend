import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LocalStorage {
    constructor() { }

    setItem(key: string, data: any): void {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
        } catch (err) {
            console.error('[LocalStore] Error al intentar guardar el elemento');
            throw err;
        }
    }

    getItem(key: string): any {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        } catch (err) {
            console.error('[LocalStore] Error al obtener datos')
            throw err;
        }
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
}