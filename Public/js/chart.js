document.addEventListener('DOMContentLoaded', function() {
    const sortBtn = document.getElementById("sortBtn");
    if (sortBtn) {
        sortBtn.addEventListener("click", sortTable);
    }

    const ctx = document.getElementById('wasteChart').getContext('2d');

    const wasteChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Waste Collected',
                data: [6, 7, 4, 6, 7, 4, 6, 7],
                backgroundColor: '#14532d', 
                borderRadius: 10,
                barThickness: 40,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'kg';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
});
