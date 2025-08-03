
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [alignCodes, setAlignCodes] = useState([]);
  const [geoCodes, setGeoCodes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ align: [], geo: [], employee: [] });

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setFilteredData(json);
        setAlignCodes([...new Set(json.map(d => d["Align code"]))]);
        setGeoCodes([...new Set(json.map(d => d["geo code"]))]);
        setEmployees([...new Set(json.map(d => d["employee name"]))]);
      });
  }, []);

  useEffect(() => {
    const filtered = data.filter(d =>
      (filters.align.length === 0 || filters.align.includes(d["Align code"])) &&
      (filters.geo.length === 0 || filters.geo.includes(d["geo code"])) &&
      (filters.employee.length === 0 || filters.employee.includes(d["employee name"]))
    );
    setFilteredData(filtered);
  }, [filters, data]);

  const updateFilter = (type, value) => {
    setFilters(prev => {
      const current = new Set(prev[type]);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [type]: Array.from(current) };
    });
  };

  const totalEarnings = filteredData.reduce((sum, d) => sum + d["total earning"], 0);
  const averageEarnings = filteredData.length ? totalEarnings / new Set(filteredData.map(d => d["employee name"])).size : 0;
  const uniqueEmployees = new Set(filteredData.map(d => d["employee name"])).size;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>Filters</h3>
        <div className="filter-group">
          <h5>Align Code</h5>
          {alignCodes.map(code => (
            <label key={code}><input type="checkbox" onChange={() => updateFilter('align', code)} /> {code}</label>
          ))}
        </div>
        <div className="filter-group">
          <h5>Geo Code</h5>
          {geoCodes.map(code => (
            <label key={code}><input type="checkbox" onChange={() => updateFilter('geo', code)} /> {code}</label>
          ))}
        </div>
        <div className="filter-group">
          <h5>Employee</h5>
          {employees.map(emp => (
            <label key={emp}><input type="checkbox" onChange={() => updateFilter('employee', emp)} /> {emp}</label>
          ))}
        </div>
      </aside>
      <main className="content">
        <h2>Geo Earnings Dashboard</h2>
        <div className="kpis">
          <div className="kpi">Total Earnings: ${totalEarnings.toFixed(0)}</div>
          <div className="kpi">Avg per Employee: ${averageEarnings.toFixed(2)}</div>
          <div className="kpi">Unique Employees: {uniqueEmployees}</div>
        </div>
        <Plot
          data={[{
            type: 'bar',
            x: filteredData.map(d => d["Align code"]),
            y: filteredData.map(d => d["total earning"]),
            marker: { color: 'rgba(0, 123, 255, 0.6)' }
          }]}
          layout={{ title: 'Total Earnings by Align Code' }}
        />
      </main>
    </div>
  );
};

export default App;
