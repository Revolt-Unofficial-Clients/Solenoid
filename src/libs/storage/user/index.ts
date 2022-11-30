const store = (keyName: string, keyValue: any) => {
    const obj = JSON.stringify(keyValue);
    localStorage.setItem(keyName, obj);
}

const getFromStorage = async <T>(keyName: string): Promise<T> => {
    try {
        const item = await localStorage.getItem(keyName);
        if (item) {
            const parsed: T = JSON.parse(item);
            return parsed;
        }
    } catch (e) {
        console.error(e);
    }
}

const clearStorage = (keyName: string) => {
    localStorage.removeItem(keyName);
}

export {store, getFromStorage, clearStorage}