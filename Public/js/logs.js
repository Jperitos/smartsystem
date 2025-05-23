
function loadActivityLogs() {
    const selectedDate = $('#activityDateFilter').val();

    $.ajax({
      url: 'http://localhost:3000/api/activity-logs',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ date: selectedDate }),
      success: function (data) {
        const tbody = $('#activityTableBody');
        tbody.empty();

        if (data.length === 0) {
          tbody.append('<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No activity logs found.</td></tr>');
        } else {
          data.forEach(log => {
            tbody.append(`
              <tr>
                <td>${log.bin_name}</td>
                <td>${log.floor}</td>
                <td>${log.staff_name}</td>
                <td>${log.activity_date}</td>
                <td>${log.start_time}</td>
                <td>${log.status}</td>
              </tr>
            `);
          });
        }
      },
      error: function () {
        $('#activityTableBody').html('<tr><td colspan="6" style="color:red; text-align:center;">Failed to load data.</td></tr>');
      }
    });
  }

  $(document).ready(function () {
    loadActivityLogs();

    $('#refreshActivityLogs').click(function () {
      loadActivityLogs();
    });

    $('#activityDateFilter').change(function () {
      loadActivityLogs();
    });
  });

