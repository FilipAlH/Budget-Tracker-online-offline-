let db;
let version;

const request = indexedDb.open('BudgetDb', version || 1)

request.onupgradeneeded = function(event) {
    const { previousVersion } = event
    const newVersion = event.newVersion || db.version

    db = event.target.result

    if(db.objectStoreNames.length === 0) {
        db.objectStoreNames('BudgetStore', { autoIncrement : true })
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode)
}

function CheckDatabase() {

    let transaction = db.transaction(['BudgetStore'], 'readwrite')

    const store = transaction.objectStore('BudgetStore')

    const getAll = store.getAll()

    getAll.onsucess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(getAll.result),
            })
                .then((response) => response.json())
                    .then((data) => {
                        if (data.length !== 0) {
                            transaction = db.transaction(['BudgetStore'], 'readwrite')

                            const currentStore = transaction.objectStore('BudgetStore')

                            currentStore.clear()
                        }
                    })
        }
    }
}

request.onsuccess = function(event) {

    db = event.target.result

    if(navigator.onLine) {
        checkDatabase()
    }
}

const saveRecord = (data) => {

    const transaction = db.transaction(['BudgetStore'], 'readwrite')

    const store = transaction.objectStore('BudgetStore')

    store.add(data)
}

window.addEventListener('online', checkDatabase)