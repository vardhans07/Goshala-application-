import axios from 'axios';

export default function Reports() {
  const token = localStorage.getItem('token');

  const downloadExcel = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports/excel', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to download Excel report');
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to download PDF report');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-green-700 mb-10 text-center">Reports & Downloads</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={downloadExcel}
          className="bg-white p-10 rounded-3xl shadow hover:shadow-xl cursor-pointer transition text-center border-2 border-dashed border-green-200 hover:border-green-600"
        >
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-2xl font-semibold mb-2">Download Excel Report</h3>
          <p className="text-gray-600">Full attendance data in .xlsx format</p>
        </div>

        <div 
          onClick={downloadPDF}
          className="bg-white p-10 rounded-3xl shadow hover:shadow-xl cursor-pointer transition text-center border-2 border-dashed border-green-200 hover:border-green-600"
        >
          <div className="text-6xl mb-6">📄</div>
          <h3 className="text-2xl font-semibold mb-2">Download PDF Report</h3>
          <p className="text-gray-600">Printable attendance report</p>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-12">
        Note: Add more report routes in backend if needed (daily/weekly filter)
      </p>
    </div>
  );
}