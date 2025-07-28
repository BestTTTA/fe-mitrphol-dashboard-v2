"use client";
import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7890";

function Map({ center }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Data mapping for filters
  const yearOptions = [
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" }
  ];

  const monthRangeOptions = [
    { value: { start: 1, end: 3 }, label: "ช่วง 1-3 เดือน" },
    { value: { start: 4, end: 6 }, label: "ช่วง 4-6 เดือน" },
    { value: { start: 7, end: 9 }, label: "ช่วง 7-9 เดือน" },
    { value: { start: 10, end: 12 }, label: "ช่วง 10-12 เดือน" }
  ];

  // Updated project types to match the new mapping
  const projectTypeOptions = [
    { value: "ratoon_1", label: "อ้อยตอ 1", cane_type: "ratoon" },
    { value: "ratoon_2", label: "อ้อยตอ 2", cane_type: "ratoon" },
    { value: "ratoon_3", label: "อ้อยตอ 3", cane_type: "ratoon" },
    { value: "ratoon_4", label: "อ้อยตอ 4", cane_type: "ratoon" },
    { value: "ratoon_5", label: "อ้อยตอ 5", cane_type: "ratoon" },
    { value: "planted_october", label: "อ้อยปลูกตุลาคม", cane_type: "plant_october" },
    { value: "planted_watered", label: "อ้อยปลูกน้ำราด", cane_type: "plant_watered" }
  ];

  // Get cane_type based on project type
  const getCaneTypeForProject = (projectType) => {
    const project = projectTypeOptions.find(p => p.value === projectType);
    return project ? project.cane_type : "ratoon";
  };

  // Get available grades for selected project type and period
  const getAvailableGrades = (projectType, period) => {
    const availableGrades = [];
    
    // Define available combinations based on your data
    const validCombinations = [
      // ratoon_1
      { project: "ratoon_1", period: "period1_1_3", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_1", period: "period2_4_6", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_1", period: "period3_7_9", grades: ["A", "B", "C", "D"] },
      
      // ratoon_2
      { project: "ratoon_2", period: "period1_1_3", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_2", period: "period2_4_6", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_2", period: "period3_7_9", grades: ["A", "B", "C", "D"] },
      
      // ratoon_3
      { project: "ratoon_3", period: "period1_1_3", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_3", period: "period2_4_6", grades: ["A", "B", "C", "D"] },
      { project: "ratoon_3", period: "period3_7_9", grades: ["A", "B", "C", "D"] },
      
      // ratoon_4 (only B, C, D)
      { project: "ratoon_4", period: "period1_1_3", grades: ["B", "C", "D"] },
      { project: "ratoon_4", period: "period2_4_6", grades: ["B", "C", "D"] },
      { project: "ratoon_4", period: "period3_7_9", grades: ["B", "C", "D"] },
      
      // ratoon_5 (only D)
      { project: "ratoon_5", period: "period1_1_3", grades: ["D"] },
      { project: "ratoon_5", period: "period2_4_6", grades: ["D"] },
      { project: "ratoon_5", period: "period3_7_9", grades: ["D"] },
      
      // planted_october
      { project: "planted_october", period: "period1_1_3", grades: ["A", "B", "C", "D"] },
      { project: "planted_october", period: "period2_4_6", grades: ["A", "B", "C", "D"] },
      { project: "planted_october", period: "period3_7_9", grades: ["A", "B", "C", "D"] },
      
      // planted_watered (only B, C, D)
      { project: "planted_watered", period: "period1_1_3", grades: ["B", "C", "D"] },
      { project: "planted_watered", period: "period2_4_6", grades: ["B", "C", "D"] },
      { project: "planted_watered", period: "period3_7_9", grades: ["B", "C", "D"] }
    ];
    
    const combination = validCombinations.find(
      combo => combo.project === projectType && combo.period === period
    );
    
    return combination ? combination.grades : [];
  };

  // Get sugarcane grade options based on selected project and period
  const getGradeOptions = () => {
    const period = getPeriodFromMonthRange(selectedMonthRange.value);
    const availableGrades = getAvailableGrades(selectedProjectType, period);
    
    return availableGrades.map(grade => ({
      value: grade,
      label: `เกรด ${grade}`
    }));
  };

  // Helper function to get period from month range
  const getPeriodFromMonthRange = (monthRange) => {
    const { start, end } = monthRange;
    if (start === 1 && end === 3) return "period1_1_3";
    if (start === 4 && end === 6) return "period2_4_6";
    if (start === 7 && end === 9) return "period3_7_9";
    if (start === 10 && end === 12) return "period4_10_12";
    return "period1_1_3";
  };

  // State for filters - now includes cane_type
  const [filters, setFilters] = useState({
    year: 2025,
    start_month: 1,
    end_month: 3,
    project_name: "ratoon_1",
    period: "period1_1_3",
    sugarcane_grade: "A",
    std_type: "mean_median",
    indices: "ndvi,gli,ndwi", 
    zones: "MPDC,SB,MAC,MPV,MPL,MPK,MKS,MKB",
    include_raw_data: true,
    limit: 10000000,
    cane_type: "ratoon", // Add cane_type to initial filters
  });

  // State for separate filter selections
  const [selectedProjectType, setSelectedProjectType] = useState("ratoon_1");
  const [selectedMonthRange, setSelectedMonthRange] = useState(monthRangeOptions[0]);
  const [selectedSugarcaneGrade, setSelectedSugarcaneGrade] = useState("A");

  // State for focused zone
  const [focusedZone, setFocusedZone] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // State for data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);

  // State for standard values update
  const [updateMode, setUpdateMode] = useState(false);
  const [standardValues, setStandardValues] = useState({});
  const [standardValuesLoaded, setStandardValuesLoaded] = useState(false);
  
  // Available indices with checkbox selection
  const [availableIndices] = useState([
    { key: 'ndvi', label: 'NDVI', selected: true },
    { key: 'gli', label: 'GLI', selected: true },
    { key: 'ndwi', label: 'NDWI', selected: true },
    { key: 'cigreen', label: 'CIGreen', selected: false },
    { key: 'pvr', label: 'PVR', selected: false },
    { key: 'soil_tempt', label: 'Soil Temperature', selected: false },
    { key: 'tempt', label: 'Temperature', selected: false },
    { key: 'solar_radiation', label: 'Solar Radiation', selected: false },
    { key: 'precipitation', label: 'Precipitation', selected: false },
  ]);
  
  const [selectedIndices, setSelectedIndices] = useState(
    availableIndices.filter(item => item.selected).map(item => item.key)
  );

  const zoneCenters = {
    SB: { lat: 14.86250407773616, lng: 106.3585499327103 },
    MPDC: { lat: 14.84514, lng: 99.75922 },
    MAC: { lat: 15.828701000429223, lng: 104.47471520283926 },
    MPV: { lat: 16.67827120388637, lng: 102.44576336099253 },
    MPL: { lat: 7.067065149704857, lng: 117.59963900704362 },
    MPK: { lat: 16.4840064769643, lng: 102.1212705588527 },
    MKS: { lat: 16.462588608501633, lng: 104.04029264983633 },
    MPKB: { lat: 16.096672809152835, lng: 101.87271858619893 },
  };

  const mapRef = useRef(null);

  // Simulate loading progress
  const simulateLoadingProgress = async (stages) => {
    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(stages[i]);
      const stageProgress = ((i + 1) / stages.length) * 100;
      
      // Simulate gradual progress within each stage
      for (let progress = (i / stages.length) * 100; progress <= stageProgress; progress += 10) {
        setLoadingProgress(Math.min(progress, 100));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Fetch all standard values for all indices
  const fetchAllStandardValues = async () => {
    try {
      setLoadingStage('Fetching standard values...');
      setLoadingProgress(10);
      
      // Create a temporary filter with all indices to get complete standard values
      const allIndicesString = availableIndices.map(item => item.key).join(',');
      const tempParams = new URLSearchParams({
        ...filters,
        indices: allIndicesString,
        include_raw_data: false, // Don't need raw data for standards
        limit: 1
      });
      
      const response = await fetch(`${API_BASE_URL}/analytics?${tempParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setLoadingProgress(30);
      const data = await response.json();
      
      // Extract standard values from the first zone
      if (data.zone_statistics && data.zone_statistics.length > 0) {
        const firstZoneStdValues = data.zone_statistics[0].std_values;
        if (firstZoneStdValues && Object.keys(firstZoneStdValues).length > 0) {
          setStandardValues(firstZoneStdValues);
          setStandardValuesLoaded(true);
        }
      }
      setLoadingProgress(40);
    } catch (err) {
      console.error("Error fetching all standard values:", err);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      const stages = [
        'Preparing request...',
        'Fetching analytics data...',
        'Processing zone statistics...',
        'Analyzing data patterns...',
        'Rendering visualizations...'
      ];
      
      // Start loading simulation
      simulateLoadingProgress(stages);
      
      setLoadingStage('Fetching analytics data...');
      setLoadingProgress(50);
      
      const params = new URLSearchParams(filters);
      
      // Debug log to check if cane_type is included
      console.log('Sending request with cane_type:', filters.cane_type);
      console.log('Full params:', params.toString());
      
      const response = await fetch(`${API_BASE_URL}/analytics?${params}`);
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('400');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      setLoadingProgress(70);
      setLoadingStage('Processing zone statistics...');
      
      const data = await response.json();
      
      // Debug log to check if cane_type is in response
      console.log('Received response:', data);
      
      setLoadingProgress(85);
      setLoadingStage('Analyzing data patterns...');
      
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalyticsData(data);
      
      setLoadingProgress(100);
      setLoadingStage('Complete!');
      
      // Clear loading after a short delay
      setTimeout(() => {
        setLoadingProgress(0);
        setLoadingStage('');
      }, 1000);

    } catch (err) {
      setError(err.message);
      console.error("Error fetching analytics data:", err);
      setLoadingProgress(0);
      setLoadingStage('');
    } finally {
      setLoading(false);
    }
  };

  // Update standard values - only send selected indices
  const updateStandardValues = async () => {
    setLoading(true);
    setLoadingProgress(0);
    
    try {
      setLoadingStage('Updating standard values...');
      setLoadingProgress(20);
      
      // Filter standard values to only include selected indices
      const selectedStandardValues = {};
      selectedIndices.forEach(index => {
        if (standardValues[index] !== undefined) {
          selectedStandardValues[index] = standardValues[index];
        }
      });

      const response = await fetch(`${API_BASE_URL}/standards/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: filters.project_name,
          period: filters.period,
          sugarcane_grade: filters.sugarcane_grade,
          standard_values: selectedStandardValues,
        }),
      });

      setLoadingProgress(50);
      const result = await response.json();
      
      if (result.success) {
        setLoadingStage('Reanalyzing data...');
        setLoadingProgress(70);
        
        alert("Standard values updated successfully!");
        
        // Re-fetch data with progress
        await fetchAnalyticsData();
      } else {
        alert(`Error: ${result.message}`);
        setLoadingProgress(0);
        setLoadingStage('');
      }
    } catch (err) {
      alert(`Error updating standards: ${err.message}`);
      setLoadingProgress(0);
      setLoadingStage('');
    } finally {
      setLoading(false);
    }
  };

  // Reset standard values - only reset selected indices
  const resetStandardValues = async () => {
    setLoading(true);
    setLoadingProgress(0);
    
    try {
      setLoadingStage('Resetting standard values...');
      setLoadingProgress(20);
      
      const response = await fetch(`${API_BASE_URL}/standards/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: filters.project_name,
          period: filters.period,
          sugarcane_grade: filters.sugarcane_grade,
          indices: selectedIndices, // Only reset selected indices
        }),
      });

      setLoadingProgress(50);
      const result = await response.json();
      
      if (result.success) {
        setLoadingStage('Reanalyzing data...');
        setLoadingProgress(70);
        
        alert("Standard values reset successfully!");
        if (result.updated_values) {
          // Update only the reset values
          setStandardValues(prev => ({
            ...prev,
            ...result.updated_values
          }));
        }
        
        // Re-fetch data with progress
        await fetchAnalyticsData();
      } else {
        alert(`Error: ${result.message}`);
        setLoadingProgress(0);
        setLoadingStage('');
      }
    } catch (err) {
      alert(`Error resetting standards: ${err.message}`);
      setLoadingProgress(0);
      setLoadingStage('');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    // Fetch all standard values first if not loaded
    if (!standardValuesLoaded) {
      fetchAllStandardValues();
    }
    
    fetchAnalyticsData();
  }, [filters]);

  // Update filters.indices when selectedIndices changes
  useEffect(() => {
    const indicesString = selectedIndices.join(',');
    if (indicesString !== filters.indices) {
      setFilters(prev => ({ ...prev, indices: indicesString }));
    }
    
    // Clear error when user selects indices
    if (selectedIndices.length > 0 && error) {
      setError(null);
    }
  }, [selectedIndices]);

  // Update filters when separated selections change
  useEffect(() => {
    const period = getPeriodFromMonthRange(selectedMonthRange.value);
    const availableGrades = getAvailableGrades(selectedProjectType, period);
    const caneType = getCaneTypeForProject(selectedProjectType); // Get cane_type for the project
    
    // If current grade is not available for the new combination, select the first available grade
    let newGrade = selectedSugarcaneGrade;
    if (!availableGrades.includes(selectedSugarcaneGrade)) {
      newGrade = availableGrades.length > 0 ? availableGrades[0] : "A";
      setSelectedSugarcaneGrade(newGrade);
    }
    
    setFilters(prev => ({
      ...prev,
      project_name: selectedProjectType,
      period: period,
      sugarcane_grade: newGrade,
      start_month: selectedMonthRange.value.start,
      end_month: selectedMonthRange.value.end,
      cane_type: caneType // Update cane_type based on project selection
    }));
    
    // Reset standard values loaded flag when key filter parameters change
    setStandardValuesLoaded(false);
  }, [selectedProjectType, selectedMonthRange, selectedSugarcaneGrade]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || loadError || !analyticsData) return;

    const initializeMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: center || { lat: 15.87, lng: 100.9925 },
          zoom: 7,
          mapTypeId: "satellite",
        });

        setMapInstance(map);

        // Add center marker
        const centerMarker = new window.google.maps.Marker({
          position: center || { lat: 15.87, lng: 100.9925 },
          map,
          title: "Center",
          icon: {
            url: "/manufacturing-plant.png",
            scaledSize: new window.google.maps.Size(70, 70),
          },
          zIndex: 9999,
        });

        // Add zone markers with statistics
        analyticsData.zone_statistics?.forEach((zoneStats) => {
          const zoneCenter = zoneCenters[zoneStats.zone];
          if (!zoneCenter) return;

          const zoneMarker = new window.google.maps.Marker({
            position: zoneCenter,
            map,
            title: zoneStats.zone,
            label: {
              text: zoneStats.zone,
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "bold",
            },
            icon: {
              url: "/manufacturing-plant.png",
              scaledSize: new window.google.maps.Size(60, 60),
            },
          });

          const zoneInfoContent = `
            <div style="max-width: 300px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Zone: ${zoneStats.zone}</h3>
              <div style="margin-bottom: 10px;">
                <strong>Statistics:</strong><br/>
                Total Records: ${zoneStats.total_records}<br/>
                Above Standard: ${zoneStats.above_std_count} (${zoneStats.above_std_percentage.toFixed(1)}%)<br/>
                Below Standard: ${zoneStats.below_std_count} (${zoneStats.below_std_percentage.toFixed(1)}%)
              </div>
              <div style="margin-bottom: 10px;">
                <strong>Standard Values:</strong><br/>
                ${Object.entries(zoneStats.std_values)
                  .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
                  .join("<br/>")}
              </div>
              <div>
                <strong>Location:</strong><br/>
                Lat: ${zoneCenter.lat}<br/>
                Lng: ${zoneCenter.lng}
              </div>
            </div>
          `;

          const zoneInfoWindow = new window.google.maps.InfoWindow({
            content: zoneInfoContent,
          });

          zoneMarker.addListener("click", () => {
            zoneInfoWindow.open(map, zoneMarker);
          });

          // Add raw data points for this zone
          if (zoneStats.above_records) {
            zoneStats.above_records.forEach((record) => {
              if (record.lat && record.lng) {
                const dataMarker = new window.google.maps.Marker({
                  position: { lat: parseFloat(record.lat), lng: parseFloat(record.lng) },
                  map,
                  title: `${zoneStats.zone} - Above Standard`,
                  icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                });

                const recordInfoContent = `
                  <div>
                    <p style="font-weight: bold; color: green;">Above Standard</p>
                    <p>Zone: ${record.zone}</p>
                    <p>Year: ${record.year}, Month: ${record.month}</p>
                    ${record.cane_type ? `<p>Cane Type: ${record.cane_type}</p>` : ''}
                    ${selectedIndices.map(index => 
                      `<p>${index.toUpperCase()}: ${record[index] || 'N/A'}</p>`
                    ).join('')}
                    <p>Lat: ${record.lat}, Lng: ${record.lng}</p>
                  </div>
                `;

                const recordInfoWindow = new window.google.maps.InfoWindow({
                  content: recordInfoContent,
                });

                dataMarker.addListener("click", () => {
                  recordInfoWindow.open(map, dataMarker);
                });
              }
            });
          }

          if (zoneStats.below_records) {
            zoneStats.below_records.forEach((record) => {
              if (record.lat && record.lng) {
                const dataMarker = new window.google.maps.Marker({
                  position: { lat: parseFloat(record.lat), lng: parseFloat(record.lng) },
                  map,
                  title: `${zoneStats.zone} - Below Standard`,
                  icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                });

                const recordInfoContent = `
                  <div>
                    <p style="font-weight: bold; color: red;">Below Standard</p>
                    <p>Zone: ${record.zone}</p>
                    <p>Year: ${record.year}, Month: ${record.month}</p>
                    ${record.cane_type ? `<p>Cane Type: ${record.cane_type}</p>` : ''}
                    ${selectedIndices.map(index => 
                      `<p>${index.toUpperCase()}: ${record[index] || 'N/A'}</p>`
                    ).join('')}
                    <p>Lat: ${record.lat}, Lng: ${record.lng}</p>
                  </div>
                `;

                const recordInfoWindow = new window.google.maps.InfoWindow({
                  content: recordInfoContent,
                });

                dataMarker.addListener("click", () => {
                  recordInfoWindow.open(map, dataMarker);
                });
              }
            });
          }
        });
      }
    };

    initializeMap();
  }, [isLoaded, loadError, analyticsData, center, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Reset standard values loaded flag when key filter parameters change
    if (['project_name', 'period', 'sugarcane_grade', 'std_type'].includes(key)) {
      setStandardValuesLoaded(false);
    }
  };

  // Handle project type change
  const handleProjectTypeChange = (projectType) => {
    setSelectedProjectType(projectType);
  };

  // Handle month range change
  const handleMonthRangeChange = (rangeLabel) => {
    const range = monthRangeOptions.find(r => r.label === rangeLabel);
    if (range) {
      setSelectedMonthRange(range);
    }
  };

  // Handle sugarcane grade change
  const handleSugarcaneGradeChange = (grade) => {
    setSelectedSugarcaneGrade(grade);
  };

  // Handle zone focus
  const handleZoneFocus = (zoneName) => {
    setFocusedZone(zoneName);
    
    // Update filters to show only selected zone
    setFilters(prev => ({
      ...prev,
      zones: zoneName
    }));

    // Pan map to zone center
    if (mapInstance && zoneCenters[zoneName]) {
      mapInstance.panTo(zoneCenters[zoneName]);
      mapInstance.setZoom(10);
    }
  };

  // Reset zone focus to show all zones
  const resetZoneFocus = () => {
    setFocusedZone(null);
    setFilters(prev => ({
      ...prev,
      zones: "MPDC,SB,MAC,MPV,MPL,MPK,MKS,MPKB"
    }));

    if (mapInstance) {
      mapInstance.panTo(center || { lat: 15.87, lng: 100.9925 });
      mapInstance.setZoom(7);
    }
  };

  // Handle indices checkbox selection
  const handleIndicesChange = (indexKey, checked) => {
    if (checked) {
      setSelectedIndices(prev => [...prev, indexKey]);
    } else {
      setSelectedIndices(prev => prev.filter(item => item !== indexKey));
    }
  };

  // Toggle all indices
  const toggleAllIndices = (selectAll) => {
    if (selectAll) {
      setSelectedIndices(availableIndices.map(item => item.key));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleStandardValueChange = (key, value) => {
    setStandardValues(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-sky-200 animate-pulse rounded-md"></div>
    );
  }

  if (loadError) {
    return <div>Error loading Google Maps: {loadError.message}</div>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ปี</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {yearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">ช่วงเดือน</label>
            <select
              value={selectedMonthRange.label}
              onChange={(e) => handleMonthRangeChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {monthRangeOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ประเภทอ้อย</label>
            <select
              value={selectedProjectType}
              onChange={(e) => handleProjectTypeChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Cane Type: {getCaneTypeForProject(selectedProjectType)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">เกรดอ้อย</label>
            <select
              value={selectedSugarcaneGrade}
              onChange={(e) => handleSugarcaneGradeChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {getGradeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getGradeOptions().length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ไม่มีเกรดที่สามารถเลือกได้สำหรับโครงการและช่วงเวลานี้
              </p>
            )}
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-sm font-medium mb-1">Indices Selection</label>
            <div className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Select Indices for Comparison:</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleAllIndices(true)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllIndices(false)}
                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableIndices.map((item) => (
                  <label key={item.key} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(item.key)}
                      onChange={(e) => handleIndicesChange(item.key, e.target.checked)}
                      className="rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Selected: {selectedIndices.length} indices
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Filter Summary */}
      <div className="bg-blue-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Current Filter Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Project:</span> {filters.project_name}
          </div>
          <div>
            <span className="font-medium">Cane Type:</span> {filters.cane_type}
          </div>
          <div>
            <span className="font-medium">Period:</span> {filters.period}
          </div>
          <div>
            <span className="font-medium">Grade:</span> {filters.sugarcane_grade}
          </div>
        </div>
        {analyticsData?.query_params && (
          <div className="mt-2 text-xs text-gray-600">
            API Response includes cane_type: {analyticsData.query_params.cane_type || 'Not included'}
          </div>
        )}
      </div>

      {/* Zone Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Zone Selection</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={resetZoneFocus}
            className={`px-3 py-2 rounded text-sm ${
              !focusedZone 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Zones
          </button>
          {Object.keys(zoneCenters).map((zoneName) => (
            <button
              key={zoneName}
              onClick={() => handleZoneFocus(zoneName)}
              className={`px-3 py-2 rounded text-sm ${
                focusedZone === zoneName 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {zoneName}
            </button>
          ))}
        </div>
        {focusedZone && (
          <div className="text-sm text-gray-600">
            Currently focusing on zone: <strong>{focusedZone}</strong>
          </div>
        )}
      </div>

      {/* Standard Values Management */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Standard Values Management</h3>
          <div className="space-x-2">
            <button
              onClick={() => setUpdateMode(!updateMode)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {updateMode ? 'Cancel' : 'Edit Standards'}
            </button>
            <button
              onClick={resetStandardValues}
              disabled={selectedIndices.length === 0}
              className={`px-4 py-2 rounded text-white ${
                selectedIndices.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              Reset Selected to Default ({selectedIndices.length})
            </button>
          </div>
        </div>

        {updateMode && (
          <div>
            {Object.keys(standardValues).length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Note:</strong> Only selected indices will be updated. Currently selected: {selectedIndices.join(', ')}
                  </p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {availableIndices.map(({ key, label }) => (
                    <div key={key} className={`${!selectedIndices.includes(key) ? 'opacity-50' : ''}`}>
                      <label className="block text-sm font-medium mb-1">
                        {label}
                        {!selectedIndices.includes(key) && (
                          <span className="text-xs text-gray-500 ml-1">(not selected)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={standardValues[key] || 0}
                        onChange={(e) => handleStandardValueChange(key, e.target.value)}
                        disabled={!selectedIndices.includes(key)}
                        className={`w-full p-2 border rounded ${
                          !selectedIndices.includes(key) 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={updateStandardValues}
                  disabled={selectedIndices.length === 0}
                  className={`px-6 py-2 rounded ${
                    selectedIndices.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  Update Standards ({selectedIndices.length} indices)
                </button>
              </>
            ) : (
              <div className="text-gray-500 p-4 text-center">
                Loading standard values from API...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      {analyticsData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Zone Statistics Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Zone</th>
                  <th className="px-4 py-2 text-left">Total Records</th>
                  <th className="px-4 py-2 text-left">Above Standard</th>
                  <th className="px-4 py-2 text-left">Below Standard</th>
                  <th className="px-4 py-2 text-left w-48">Performance Distribution</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.zone_statistics?.map((zone, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-medium">{zone.zone}</td>
                    <td className="px-4 py-2">{zone.total_records}</td>
                    <td className="px-4 py-2 text-green-600">{zone.above_std_count}</td>
                    <td className="px-4 py-2 text-red-600">{zone.below_std_count}</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                        <div 
                          className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${zone.above_std_percentage}%` }}
                        >
                          {zone.above_std_percentage > 15 ? `${zone.above_std_percentage.toFixed(1)}%` : ''}
                        </div>
                        <div 
                          className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${zone.below_std_percentage}%` }}
                        >
                          {zone.below_std_percentage > 15 ? `${zone.below_std_percentage.toFixed(1)}%` : ''}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Above: {zone.above_std_percentage.toFixed(1)}%</span>
                        <span>Below: {zone.below_std_percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-800 font-medium">{loadingStage || 'Loading...'}</p>
            <span className="text-blue-600 text-sm font-semibold">{loadingProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {loadingProgress === 100 ? 'Analysis complete!' : 'Please wait while we analyze your data...'}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-600">
            {error.includes('400') || error.includes('BAD_REQUEST') 
              ? "โปรดเลือกตัวเลือกการเปรียบเทียบอย่างน้อย 1 ตัวเลือก" 
              : `ไม่พบค่ามาตรฐานที่ท่านเลือก โปรดเลือกการกรองข้อมูลอื่น`}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="w-full">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "600px" }}
          className="rounded-md shadow-md"
        />
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Above Standard</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Below Standard</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Zone Centers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;