const runBtn = document.getElementById('run-btn');
const ctx = document.getElementById('chart');
const input = document.getElementById('filename');

// 🧮 Display element for storage info
const storageInfo = document.createElement('div');
storageInfo.style.marginTop = '1em';
storageInfo.style.fontFamily = 'monospace';
document.body.appendChild(storageInfo);

// Keep track of current chart instance
let currentChart = null;

async function getCsvBlob(filename) {
    let blob = await getFileFromDB(filename);

    if (!blob) {
        console.log('File not found locally, downloading:', filename);
        const response = await fetch(`/${filename}`);
        if (!response.ok) throw new Error('Download failed');
        blob = await response.blob();
        await saveFileToDB(filename, blob);
    } else {
        console.log('Loaded from IndexedDB:', filename);
    }

    return blob;
}

async function parseCsvBlob(blob) {
    return new Promise((resolve, reject) => {
        Papa.parse(blob, {
            header: true,
            dynamicTyping: true,
            complete: (res) => resolve(res.data),
            error: (err) => reject(err)
        });
    });
}

runBtn.addEventListener('click', async () => {
    const filename = input.value.trim() || 'data1.csv';
    try {
        const blob = await getCsvBlob(filename);
        const rows = await parseCsvBlob(blob);

        // Automatically detect first 2 numeric columns if available
        const headers = rows.length ? Object.keys(rows[0]) : [];
        const xKey = headers[0] || 'x';
        const yKey = headers[1] || 'y';

        const labels = rows.map(r => r[xKey]);
        const values = rows.map(r => r[yKey]);

        // ✅ Destroy existing chart if it exists
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }

        // ✅ Create new chart safely (avoid undefined scales)
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `Plot from ${filename}`,
                    data: values,
                    borderColor: 'blue',
                    fill: false,
                    pointRadius: 1,
                    tension: 0.2
                }]
            },
            // options: {
            //     responsive: true,
            //     maintainAspectRatio: false,
            //     parsing: false,
            //     scales: {
            //         x: {
            //             title: { display: true, text: xKey },
            //             type: 'category'
            //         },
            //         y: {
            //             title: { display: true, text: yKey },
            //             beginAtZero: true
            //         }
            //     }
            // }
        });

        // Update storage info display
        await updateStorageInfo();
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
});

// 🧠 Show used vs quota
async function updateStorageInfo() {
    if (!navigator.storage || !navigator.storage.estimate) {
        storageInfo.textContent = 'Storage API not supported in this browser.';
        return;
    }

    const { usage, quota } = await navigator.storage.estimate();
    const usedMB = (usage / 1024 / 1024).toFixed(2);
    const quotaMB = (quota / 1024 / 1024).toFixed(2);
    const pct = ((usage / quota) * 100).toFixed(1);

    storageInfo.textContent = `Storage used: ${usedMB} MB / ${quotaMB} MB (${pct}%)`;

    if (navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        storageInfo.textContent += persisted ? ' [Persistent]' : ' [Not persistent]';
    }
}

// Initial display
updateStorageInfo();

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

// Debug utility
window.listStoredFiles = async () => console.log(await listFiles());
