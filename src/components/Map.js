"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLoadScript } from "@react-google-maps/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7890";

const DEFAULT_LIMIT = 50000000;
const MAX_MARKERS_PER_ZONE = 50000000;

function Map({ center }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const yearOptions = [
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
  ];

  const monthRangeOptions = [
    { value: { start: 1, end: 3 }, label: "ช่วง 1-3 เดือน" },
    { value: { start: 4, end: 6 }, label: "ช่วง 4-6 เดือน" },
    { value: { start: 7, end: 9 }, label: "ช่วง 7-9 เดือน" },
    { value: { start: 10, end: 12 }, label: "ช่วง 10-12 เดือน" },
  ];

  const projectTypeOptions = [
    { value: "ratoon_1", label: "อ้อยตอ 1", cane_type: "ratoon" },
    { value: "ratoon_2", label: "อ้อยตอ 2", cane_type: "ratoon" },
    { value: "ratoon_3", label: "อ้อยตอ 3", cane_type: "ratoon" },
    { value: "ratoon_4", label: "อ้อยตอ 4", cane_type: "ratoon" },
    { value: "ratoon_5", label: "อ้อยตอ 5", cane_type: "ratoon" },
    {
      value: "planted_october",
      label: "อ้อยปลูกตุลาคม",
      cane_type: "plant_october",
    },
    {
      value: "planted_watered",
      label: "อ้อยปลูกน้ำราด",
      cane_type: "planted_watered",
    },
  ];

  // Get cane_type based on project type
  const getCaneTypeForProject = useCallback((projectType) => {
    const project = projectTypeOptions.find((p) => p.value === projectType);
    return project ? project.cane_type : "ratoon";
  }, []);

  // Get Thai label for cane type
  const getCaneTypeLabel = useCallback((caneType) => {
    switch (caneType) {
      case "ratoon":
        return "อ้อยตอ";
      case "plant_october":
        return "อ้อยปลูกตุลาคม";
      case "planted_watered":
        return "อ้อยปลูกน้ำราด";
      default:
        return caneType;
    }
  }, []);

  // Get available grades for selected project type and period
  const getAvailableGrades = useCallback((projectType, period) => {
    const validCombinations = [
      {
        project: "ratoon_1",
        period: "period1_1_3",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_1",
        period: "period2_4_6",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_1",
        period: "period3_7_9",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_2",
        period: "period1_1_3",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_2",
        period: "period2_4_6",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_2",
        period: "period3_7_9",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_3",
        period: "period1_1_3",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_3",
        period: "period2_4_6",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "ratoon_3",
        period: "period3_7_9",
        grades: ["A", "B", "C", "D"],
      },
      { project: "ratoon_4", period: "period1_1_3", grades: ["B", "C", "D"] },
      { project: "ratoon_4", period: "period2_4_6", grades: ["B", "C", "D"] },
      { project: "ratoon_4", period: "period3_7_9", grades: ["B", "C", "D"] },
      { project: "ratoon_5", period: "period1_1_3", grades: ["D"] },
      { project: "ratoon_5", period: "period2_4_6", grades: ["D"] },
      { project: "ratoon_5", period: "period3_7_9", grades: ["D"] },
      {
        project: "planted_october",
        period: "period1_1_3",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "planted_october",
        period: "period2_4_6",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "planted_october",
        period: "period3_7_9",
        grades: ["A", "B", "C", "D"],
      },
      {
        project: "planted_watered",
        period: "period1_1_3",
        grades: ["B", "C", "D"],
      },
      {
        project: "planted_watered",
        period: "period2_4_6",
        grades: ["B", "C", "D"],
      },
      {
        project: "planted_watered",
        period: "period3_7_9",
        grades: ["B", "C", "D"],
      },
    ];

    const combination = validCombinations.find(
      (combo) => combo.project === projectType && combo.period === period
    );

    return combination ? combination.grades : [];
  }, []);

  // Helper function to get period from month range
  const getPeriodFromMonthRange = useCallback((monthRange) => {
    const { start, end } = monthRange;
    if (start === 1 && end === 3) return "period1_1_3";
    if (start === 4 && end === 6) return "period2_4_6";
    if (start === 7 && end === 9) return "period3_7_9";
    if (start === 10 && end === 12) return "period4_10_12";
    return "period1_1_3";
  }, []);

  // State for filters - removed sugarcane_grade from initial state
  const [filters, setFilters] = useState({
    year: 2025,
    start_month: 1,
    end_month: 3,
    project_name: "ratoon_1",
    period: "period1_1_3",
    std_type: "mean_median",
    indices: "ndvi",
    zones: "MPDC,SB,MAC,MPL,MPK,MKS,MKB",
    include_raw_data: true,
    limit: DEFAULT_LIMIT,
    cane_type: "ratoon",
    _t: Date.now(),
    no_cache: true,
  });

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState("ratoon_1");
  const [selectedMonthRange, setSelectedMonthRange] = useState(
    monthRangeOptions[0]
  );
  const [activeStatisticsGrade, setActiveStatisticsGrade] = useState("A"); // For statistics tab

  // State for performance management
  const [dataLimit, setDataLimit] = useState(DEFAULT_LIMIT);
  const [showAllData, setShowAllData] = useState(false);

  const [focusedZone, setFocusedZone] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [allGradesData, setAllGradesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState(null);

  const [updateMode, setUpdateMode] = useState(false);
  const [standardValues, setStandardValues] = useState({});
  const [standardValuesLoaded, setStandardValuesLoaded] = useState(false);

  const [availableIndices] = useState([
    { key: "ndvi", label: "NDVI", selected: true },
    { key: "gli", label: "GLI", selected: false },
    { key: "ndwi", label: "NDWI", selected: false },
    { key: "cigreen", label: "CIGreen", selected: false },
    { key: "pvr", label: "PVR", selected: false },
    { key: "soil_tempt", label: "Soil Temperature", selected: false },
    { key: "tempt", label: "Temperature", selected: false },
    { key: "solar_radiation", label: "Solar Radiation", selected: false },
    { key: "precipitation", label: "Precipitation", selected: false },
  ]);

  const [selectedIndices, setSelectedIndices] = useState(["ndvi"]);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [hasUnappliedStandardChanges, setHasUnappliedStandardChanges] =
    useState(false);

  // Reference for markers cleanup
  const markersRef = useRef([]);

  const zoneCenters = {
    SB: { lat: 14.862504078842958, lng: 100.358549932741414 },
    MPDC: { lat: 14.84514, lng: 99.75922 },
    MAC: { lat: 15.828701000429223, lng: 104.47471520283926 },
    // MPV: { lat: 16.67827120388637, lng: 102.44576336099253 },
    MPL: { lat: 7.067065149704857, lng: 117.59963900704362 },
    MPK: { lat: 16.4840064769643, lng: 102.1212705588527 },
    MKS: { lat: 16.462588608501633, lng: 104.04029264983633 },
    MKB: { lat: 16.096672809152835, lng: 101.87271858619893 },
  };

  const mapRef = useRef(null);

  // Cleanup markers function
  const clearAllMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // Sample data function for performance
  const sampleData = useCallback((records, maxCount) => {
    if (!records || records.length <= maxCount) return records;

    const step = Math.ceil(records.length / maxCount);
    return records.filter((_, index) => index % step === 0);
  }, []);

  // Get all available grades for current selection
  const availableGrades = useMemo(() => {
    const period = getPeriodFromMonthRange(selectedMonthRange.value);
    return getAvailableGrades(selectedProjectType, period);
  }, [
    selectedProjectType,
    selectedMonthRange,
    getAvailableGrades,
    getPeriodFromMonthRange,
  ]);

  // Simulate loading progress
  const simulateLoadingProgress = useCallback(async (stages) => {
    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(stages[i]);
      const stageProgress = ((i + 1) / stages.length) * 100;

      for (
        let progress = (i / stages.length) * 100;
        progress <= stageProgress;
        progress += 10
      ) {
        setLoadingProgress(Math.min(progress, 100));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }, []);

  // Fetch all standard values - modified to fetch for the first available grade
  const fetchAllStandardValues = useCallback(
    async (filtersToUse) => {
      try {
        setLoadingStage("Fetching standard values...");
        setLoadingProgress(10);

        const allIndicesString = availableIndices
          .map((item) => item.key)
          .join(",");
        
        // Use the first available grade for fetching standard values
        const firstGrade = availableGrades.length > 0 ? availableGrades[0] : "A";
        
        const tempParams = new URLSearchParams({
          ...filtersToUse,
          sugarcane_grade: firstGrade,
          indices: allIndicesString,
          include_raw_data: false,
          limit: 100,
          _t: Date.now(),
          no_cache: true,
        });

        const response = await fetch(
          `${API_BASE_URL}/analytics?${tempParams}`,
          {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setLoadingProgress(30);
        const data = await response.json();

        if (data.zone_statistics && data.zone_statistics.length > 0) {
          const firstZoneStdValues = data.zone_statistics[0].std_values;
          if (
            firstZoneStdValues &&
            Object.keys(firstZoneStdValues).length > 0
          ) {
            setStandardValues(firstZoneStdValues);
            setStandardValuesLoaded(true);
          }
        }
        setLoadingProgress(40);
      } catch (err) {
        console.error("Error fetching all standard values:", err);
      }
    },
    [availableIndices, availableGrades]
  );

  // Fetch analytics data for all grades
  const fetchAllGradesData = useCallback(
    async (filtersToUse) => {
      const newAllGradesData = {};
      const period = getPeriodFromMonthRange(selectedMonthRange.value);
      const availableGradesForSelection = getAvailableGrades(
        selectedProjectType,
        period
      );

      try {
        setLoadingStage("Fetching data for all grades...");
        setLoadingProgress(50);

        for (let i = 0; i < availableGradesForSelection.length; i++) {
          const grade = availableGradesForSelection[i];
          const gradeFilters = {
            ...filtersToUse,
            sugarcane_grade: grade,
            limit: Math.min(dataLimit, 10000),
            include_raw_data: true, // Changed to true to get map data
            _t: Date.now(),
            no_cache: true,
          };

          const params = new URLSearchParams(gradeFilters);

          try {
            const response = await fetch(
              `${API_BASE_URL}/analytics?${params}`,
              {
                method: "GET",
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                  Expires: "0",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              newAllGradesData[grade] = data;
            } else {
              console.warn(`Failed to fetch data for grade ${grade}`);
              newAllGradesData[grade] = null;
            }
          } catch (err) {
            console.error(`Error fetching data for grade ${grade}:`, err);
            newAllGradesData[grade] = null;
          }

          // Update progress
          const progress =
            50 + ((i + 1) / availableGradesForSelection.length) * 20;
          setLoadingProgress(progress);
        }

        setAllGradesData(newAllGradesData);
        setLoadingProgress(70);
        
        // Set the analyticsData to the combined data for map rendering
        setAnalyticsData(newAllGradesData);
        
      } catch (err) {
        console.error("Error fetching all grades data:", err);
      }
    },
    [
      dataLimit,
      selectedProjectType,
      selectedMonthRange,
      getAvailableGrades,
      getPeriodFromMonthRange,
    ]
  );

  // Fetch analytics data with optimization - modified to fetch all grades
  const fetchAnalyticsData = useCallback(
    async (filtersToUse) => {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const stages = [
          "Preparing optimized request...",
          "Fetching all grades data...",
          "Processing statistics...",
          "Optimizing markers...",
          "Rendering map...",
        ];

        simulateLoadingProgress(stages);

        setLoadingStage("Fetching all grades data...");
        setLoadingProgress(50);

        // Fetch data for all available grades
        await fetchAllGradesData(filtersToUse);

        setLoadingProgress(85);
        setLoadingStage("Optimizing markers...");

        setLoadingProgress(100);
        setLoadingStage("Complete!");

        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingStage("");
        }, 1000);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching analytics data:", err);
        setLoadingProgress(0);
        setLoadingStage("");
      } finally {
        setLoading(false);
      }
    },
    [simulateLoadingProgress, fetchAllGradesData]
  );

  // Apply filters function
  const applyFilters = useCallback(async () => {
    setHasUnappliedChanges(false);
    setAppliedFilters({ ...filters });

    // Clear existing markers
    clearAllMarkers();
    setAnalyticsData(null);
    setAllGradesData({});
    setStandardValuesLoaded(false);

    if (!standardValuesLoaded) {
      await fetchAllStandardValues(filters);
    }

    await fetchAnalyticsData(filters);
  }, [
    filters,
    standardValuesLoaded,
    clearAllMarkers,
    fetchAllStandardValues,
    fetchAnalyticsData,
  ]);

  // Update standard values - modified to work with the first available grade
  const updateStandardValues = useCallback(async () => {
    setLoading(true);
    setLoadingProgress(0);

    try {
      setLoadingStage("Updating standard values...");
      setLoadingProgress(20);

      const selectedStandardValues = {};
      selectedIndices.forEach((index) => {
        if (standardValues[index] !== undefined) {
          selectedStandardValues[index] = standardValues[index];
        }
      });

      // Use the first available grade for updating standards
      const firstGrade = availableGrades.length > 0 ? availableGrades[0] : "A";

      const response = await fetch(`${API_BASE_URL}/standards/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          project_name: filters.project_name,
          period: filters.period,
          sugarcane_grade: firstGrade,
          standard_values: selectedStandardValues,
          _t: Date.now(),
        }),
      });

      setLoadingProgress(50);
      const result = await response.json();

      if (result.success) {
        setLoadingStage("Changes saved...");
        setLoadingProgress(70);

        alert("Standard values updated successfully!");
        setAnalyticsData(null);
        setAllGradesData({});
        setStandardValuesLoaded(false);
        setHasUnappliedStandardChanges(true);
        setHasUnappliedChanges(true);
      } else {
        alert(`Error: ${result.message}`);
        setLoadingProgress(0);
        setLoadingStage("");
      }
    } catch (err) {
      alert(`Error updating standards: ${err.message}`);
      setLoadingProgress(0);
      setLoadingStage("");
    } finally {
      setLoading(false);
    }
  }, [selectedIndices, standardValues, filters, availableGrades]);

  // Reset standard values - modified to work with the first available grade
  const resetStandardValues = useCallback(async () => {
    setLoading(true);
    setLoadingProgress(0);

    try {
      setLoadingStage("Resetting standard values...");
      setLoadingProgress(20);

      // Use the first available grade for resetting standards
      const firstGrade = availableGrades.length > 0 ? availableGrades[0] : "A";

      const response = await fetch(`${API_BASE_URL}/standards/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          project_name: filters.project_name,
          period: filters.period,
          sugarcane_grade: firstGrade,
          indices: selectedIndices,
          _t: Date.now(),
        }),
      });

      setLoadingProgress(50);
      const result = await response.json();

      if (result.success) {
        setLoadingStage("Changes saved...");
        setLoadingProgress(70);

        alert("Standard values reset successfully!");
        if (result.updated_values) {
          setStandardValues((prev) => ({
            ...prev,
            ...result.updated_values,
          }));
        }

        setAnalyticsData(null);
        setAllGradesData({});
        setHasUnappliedStandardChanges(true);
        setHasUnappliedChanges(true);
      } else {
        alert(`Error: ${result.message}`);
        setLoadingProgress(0);
        setLoadingStage("");
      }
    } catch (err) {
      alert(`Error resetting standards: ${err.message}`);
      setLoadingProgress(0);
      setLoadingStage("");
    } finally {
      setLoading(false);
    }
  }, [filters, selectedIndices, availableGrades]);

  // Initial load
  useEffect(() => {
    if (!appliedFilters) {
      applyFilters();
    }
  }, [applyFilters, appliedFilters]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      clearAllMarkers();
    };
  }, [clearAllMarkers]);

  // Track filter changes - removed sugarcane_grade from tracking
  useEffect(() => {
    if (appliedFilters) {
      const filterKeys = [
        "year",
        "start_month",
        "end_month",
        "project_name",
        "period",
        "indices",
        "zones",
        "cane_type",
      ];
      const hasChanges = filterKeys.some(
        (key) => filters[key] !== appliedFilters[key]
      );

      if (hasChanges) {
        setHasUnappliedChanges(true);
      }
    }
  }, [filters, appliedFilters]);

  // Update filters.indices when selectedIndices changes
  useEffect(() => {
    const indicesString = selectedIndices.join(",");
    if (indicesString !== filters.indices) {
      setFilters((prev) => ({
        ...prev,
        indices: indicesString,
        _t: Date.now(),
      }));
    }

    if (selectedIndices.length > 0 && error) {
      setError(null);
    }
  }, [selectedIndices, filters.indices, error]);

  // Initialize map with all grades data - Modified version
  useEffect(() => {
    if (!isLoaded || loadError || !allGradesData || Object.keys(allGradesData).length === 0) return;

    const initializeMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        // Clear existing markers first
        clearAllMarkers();

        const map = new window.google.maps.Map(mapRef.current, {
          center: center || { lat: 15.87, lng: 100.9925 },
          zoom: 7,
          mapTypeId: "satellite",
        });

        setMapInstance(map);

        // Function to get pin color based on grade
        const getPinColor = (grade) => {
          const colors = {
            'A': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            'B': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
            'C': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            'D': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          };
          return colors[grade] || colors['A'];
        };

        // Add zone markers first
        const addedZones = new Set();

        // Iterate through all grades data
        Object.entries(allGradesData).forEach(([grade, gradeData]) => {
          if (!gradeData || !gradeData.zone_statistics) return;

          gradeData.zone_statistics.forEach((zoneStats) => {
            const zoneCenter = zoneCenters[zoneStats.zone];
            if (!zoneCenter || addedZones.has(zoneStats.zone)) return;

            // Add zone marker only once
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
            markersRef.current.push(zoneMarker);
            addedZones.add(zoneStats.zone);

            const zoneInfoContent = `
              <div style="max-width: 300px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Zone: ${zoneStats.zone}</h3>
                <div style="margin-bottom: 10px;">
                  <strong>Statistics for Grade ${grade}:</strong><br/>
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
          });
        });

        // Add data points for ALL grades - Above Standard only
        Object.entries(allGradesData).forEach(([grade, gradeData]) => {
          if (!gradeData || !gradeData.zone_statistics) return;

          gradeData.zone_statistics.forEach((zoneStats) => {
            const gradeRecords = zoneStats.above_records || [];

            gradeRecords.forEach((record, index) => {
              if (record.lat && record.lng && index < MAX_MARKERS_PER_ZONE) {
                const appliedIndices = appliedFilters
                  ? appliedFilters.indices.split(",")
                  : ["ndvi"];
                
                const pinColor = getPinColor(grade);

                const dataMarker = new window.google.maps.Marker({
                  position: {
                    lat: parseFloat(record.lat),
                    lng: parseFloat(record.lng),
                  },
                  map,
                  title: `${zoneStats.zone} - เกรด ${grade} (Above Standard)`,
                  icon: pinColor,
                });
                markersRef.current.push(dataMarker);

                const recordInfoContent = `
                  <div style="max-width: 370px;">
                    <h4 style="margin: 0 0 8px 0; color: #059669; font-weight: bold;">
                      📈 Above Standard
                    </h4>
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 2px solid #bbf7d0;">
                      <p style="margin: 3px 0;"><strong>Zone:</strong> ${record.zone}</p>
                      <p style="margin: 3px 0;"><strong>ประเภทอ้อย:</strong> ${getCaneTypeLabel(
                        record.cane_type ||
                          (appliedFilters ? appliedFilters.cane_type : "ratoon")
                      )}</p>
                      <p style="margin: 3px 0;"><strong>เกรด:</strong> 
                        <span style="background-color: ${grade === 'A' ? '#22c55e' : grade === 'B' ? '#eab308' : grade === 'C' ? '#f97316' : '#ef4444'}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
                          ${grade}
                        </span>
                      </p>
                      <p style="margin: 3px 0;"><strong>ปี/เดือน:</strong> ${record.year}/${record.month}</p>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                      <strong>🌱 Vegetation Indices:</strong><br/>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                        ${appliedIndices
                          .map((index) => {
                            const value = record[index];
                            const bgColor = grade === 'A' ? '#22c55e' : grade === 'B' ? '#eab308' : grade === 'C' ? '#f97316' : '#ef4444';
                            
                            return `<span style="display: inline-block; padding: 4px 8px; background-color: ${bgColor}; color: white; border-radius: 4px; font-size: 11px; font-weight: bold;">
                              ${index.toUpperCase()}: ${
                                value !== undefined ? Number(value).toFixed(3) : "N/A"
                              }
                            </span>`;
                          })
                          .join("")}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                      <strong>📊 Standard Values:</strong><br/>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                        ${appliedIndices
                          .map((index) => {
                            const standardValue = zoneStats.std_values[index];
                            
                            return `<span style="display: inline-block; padding: 3px 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3px; font-size: 10px;">
                              ${index.toUpperCase()} > ${standardValue || 'N/A'}
                            </span>`;
                          })
                          .join("")}
                      </div>
                    </div>
                    
                    <div style="font-size: 11px; color: #64748b; background-color: #f8fafc; padding: 6px; border-radius: 4px;">
                      <strong>📍 Location:</strong> ${record.lat}, ${record.lng}
                    </div>
                  </div>
                `;

                const recordInfoWindow = new window.google.maps.InfoWindow({
                  content: recordInfoContent,
                  maxWidth: 400,
                });

                dataMarker.addListener("click", () => {
                  recordInfoWindow.open(map, dataMarker);
                });
              }
            });
          });
        });

        // Add legend for pin colors - matching table grades
        const legend = document.createElement('div');
        legend.innerHTML = `
          <div style="background: white; padding: 12px; margin: 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 12px; font-family: Arial, sans-serif;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #374151;">📍 All Grades Distribution (Above Standard)</div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <div style="width: 14px; height: 14px; background: #22c55e; border-radius: 50%; margin-right: 8px; border: 1px solid #16a34a;"></div>
              <span style="color: #374151;">เกรด A</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <div style="width: 14px; height: 14px; background: #eab308; border-radius: 50%; margin-right: 8px; border: 1px solid #ca8a04;"></div>
              <span style="color: #374151;">เกรด B</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <div style="width: 14px; height: 14px; background: #f97316; border-radius: 50%; margin-right: 8px; border: 1px solid #ea580c;"></div>
              <span style="color: #374151;">เกรด C</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <div style="width: 14px; height: 14px; background: #ef4444; border-radius: 50%; margin-right: 8px; border: 1px solid #dc2626;"></div>
              <span style="color: #374151;">เกรด D</span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
              Showing all available grades for current selection
            </div>
          </div>
        `;
        
        map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

        console.log(
          `Map initialized with ${markersRef.current.length} markers (All Grades - Above Standard Only)`
        );
      }
    };

    initializeMap();
  }, [
    isLoaded,
    loadError,
    allGradesData,
    center,
    appliedFilters,
    clearAllMarkers,
    getCaneTypeLabel,
  ]);

  // Update filters when selections change - removed sugarcane_grade related logic
  useEffect(() => {
    const period = getPeriodFromMonthRange(selectedMonthRange.value);
    const caneType = getCaneTypeForProject(selectedProjectType);

    // Set active statistics grade to the first available grade if not already set
    if (!availableGrades.includes(activeStatisticsGrade)) {
      setActiveStatisticsGrade(
        availableGrades.length > 0 ? availableGrades[0] : "A"
      );
    }

    setFilters((prev) => ({
      ...prev,
      project_name: selectedProjectType,
      period: period,
      start_month: selectedMonthRange.value.start,
      end_month: selectedMonthRange.value.end,
      cane_type: caneType,
      _t: Date.now(),
      no_cache: true,
    }));
  }, [
    selectedProjectType,
    selectedMonthRange,
    activeStatisticsGrade,
    getPeriodFromMonthRange,
    getCaneTypeForProject,
    availableGrades,
  ]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      _t: Date.now(),
      no_cache: true,
    }));
  }, []);

  const handleProjectTypeChange = useCallback((projectType) => {
    setSelectedProjectType(projectType);
  }, []);

  const handleMonthRangeChange = useCallback((rangeLabel) => {
    const range = monthRangeOptions.find((r) => r.label === rangeLabel);
    if (range) {
      setSelectedMonthRange(range);
    }
  }, []);

  const handleZoneFocus = useCallback(
    (zoneName) => {
      setFocusedZone(zoneName);

      setFilters((prev) => ({
        ...prev,
        zones: zoneName,
        _t: Date.now(),
        no_cache: true,
      }));

      if (mapInstance && zoneCenters[zoneName]) {
        mapInstance.panTo(zoneCenters[zoneName]);
        mapInstance.setZoom(10);
      }
    },
    [mapInstance]
  );

  const resetZoneFocus = useCallback(() => {
    setFocusedZone(null);
    setFilters((prev) => ({
      ...prev,
      zones: "MPDC,SB,MAC,MPV,MPL,MPK,MKS,MKB",
      _t: Date.now(),
      no_cache: true,
    }));

    if (mapInstance) {
      mapInstance.panTo(center || { lat: 15.87, lng: 100.9925 });
      mapInstance.setZoom(7);
    }
  }, [mapInstance, center]);

  const handleIndicesChange = useCallback((indexKey, checked) => {
    if (checked) {
      setSelectedIndices((prev) => [...prev, indexKey]);
    } else {
      setSelectedIndices((prev) => prev.filter((item) => item !== indexKey));
    }
  }, []);

  const toggleAllIndices = useCallback(
    (selectAll) => {
      if (selectAll) {
        setSelectedIndices(availableIndices.map((item) => item.key));
      } else {
        setSelectedIndices([]);
      }
    },
    [availableIndices]
  );

  const handleStandardValueChange = useCallback((key, value) => {
    setStandardValues((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
    setHasUnappliedStandardChanges(true);
  }, []);

  const handleDataLimitChange = useCallback((newLimit) => {
    setDataLimit(newLimit);
    setHasUnappliedChanges(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-sky-200 animate-pulse rounded-md flex items-center justify-center">
        <div className="text-gray-600">Loading Google Maps...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-red-600 p-4">
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Apply Changes Button */}
      {(hasUnappliedChanges || hasUnappliedStandardChanges) && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-orange-800 font-semibold">
                Changes Need to be Applied
              </h4>
              <p className="text-orange-700 text-sm">
                {hasUnappliedStandardChanges && hasUnappliedChanges
                  ? "You have updated standard values and modified filters. Click Apply to fetch optimized data for all grades and update the map."
                  : hasUnappliedStandardChanges
                  ? "You have updated standard values. Click Apply to fetch optimized data for all grades and update the map."
                  : "You have modified filters. Click Apply to fetch optimized data for all grades and update the map."}
              </p>
            </div>
            <button
              onClick={applyFilters}
              disabled={loading || selectedIndices.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                loading || selectedIndices.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-lg"
              }`}
            >
              {loading ? "Applying..." : "Apply Changes"}
            </button>
          </div>
          {selectedIndices.length === 0 && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Please select at least one index before applying changes.
            </p>
          )}
        </div>
      )}

      {/* Filters Section - Removed Sugarcane Grade Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ปี</label>
            <select
              value={filters.year}
              onChange={(e) =>
                handleFilterChange("year", parseInt(e.target.value))
              }
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
              Cane Type: {getCaneTypeForProject(selectedProjectType)} | 
              Available Grades: {availableGrades.join(", ")}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">
              Indices Selection
            </label>
            <div className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
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
                  <label
                    key={item.key}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(item.key)}
                      onChange={(e) =>
                        handleIndicesChange(item.key, e.target.checked)
                      }
                      className="rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Selected: {selectedIndices.length} indices | Displaying all available grades: {availableGrades.join("&quot;", "&quot;")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Zone Selection</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={resetZoneFocus}
            className={`px-3 py-2 rounded text-sm ${
              !focusedZone
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              {updateMode ? "Cancel" : "Edit Standards"}
            </button>
            <button
              onClick={resetStandardValues}
              disabled={selectedIndices.length === 0 || loading}
              className={`px-4 py-2 rounded text-white ${
                selectedIndices.length === 0 || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-500 hover:bg-gray-600"
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
                    <strong>Note:</strong> Only selected indices will be
                    updated. Currently selected: {selectedIndices.join("&quot;", "&quot;")}
                  </p>
                  <p className="text-xs text-orange-600">
                    ⚠️ Changes to standard values will require clicking &quot; Apply
                    Changes&quot; to take effect
                  </p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {availableIndices.map(({ key, label }) => (
                    <div
                      key={key}
                      className={`${
                        !selectedIndices.includes(key) ? "opacity-50" : ""
                      }`}
                    >
                      <label className="block text-sm font-medium mb-1">
                        {label}
                        {key === "ndvi" && " (Default)"}
                        {!selectedIndices.includes(key) && (
                          <span className="text-xs text-gray-500 ml-1">
                            (not selected)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={standardValues[key] || 0}
                        onChange={(e) =>
                          handleStandardValueChange(key, e.target.value)
                        }
                        disabled={!selectedIndices.includes(key)}
                        className={`w-full p-2 border rounded ${
                          !selectedIndices.includes(key)
                            ? "bg-gray-100 cursor-not-allowed"
                            : key === "ndvi"
                            ? "bg-green-50 border-green-300"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={updateStandardValues}
                  disabled={selectedIndices.length === 0 || loading}
                  className={`px-6 py-2 rounded ${
                    selectedIndices.length === 0 || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                >
                  {loading
                    ? "Updating..."
                    : `Update Standards (${selectedIndices.length} indices)`}
                </button>
              </>
            ) : (
              <div className="text-gray-500 p-4 text-center">
                Standard values will be loaded after applying current filters...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone Statistics Summary for All Available Grades */}
      {Object.keys(allGradesData).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Zone Statistics Summary - All Available Grades</h3>
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span>✅ Data applied and current</span>
              <span className="text-xs bg-green-100 px-2 py-1 rounded">
                {availableGrades.length} grades loaded
              </span>
            </div>
          </div>

          {/* Grade Legend */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">เกรด A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm font-medium">เกรด B</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm font-medium">เกรด C</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">เกรด D</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">
              {getCaneTypeLabel(appliedFilters?.cane_type || 'ratoon')} 
              {appliedFilters && (
                <span className="text-sm text-gray-500 ml-2">
                  ({appliedFilters.year} | เดือน {appliedFilters.start_month}-{appliedFilters.end_month})
                </span>
              )}
            </h4>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Zone</th>
                    <th className="px-4 py-2 text-left">Total Above Std</th>
                    <th className="px-4 py-2 text-left">Grade Distribution (Above Standard)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Get all unique zones from all grades */}
                  {(() => {
                    const allZones = new Set();
                    Object.values(allGradesData).forEach(gradeData => {
                      if (gradeData && gradeData.zone_statistics) {
                        gradeData.zone_statistics.forEach(zone => allZones.add(zone.zone));
                      }
                    });
                    
                    return Array.from(allZones).map(zoneName => {
                      // Calculate totals and grade breakdown for this zone
                      const zoneGradeData = {};
                      
                      // Get actual data for each grade in this zone
                      availableGrades.forEach(grade => {
                        const gradeData = allGradesData[grade];
                        const zoneStats = gradeData?.zone_statistics?.find(z => z.zone === zoneName);
                        if (zoneStats && zoneStats.total_records > 0) {
                          zoneGradeData[grade] = {
                            total: zoneStats.total_records,
                            above: zoneStats.above_std_count,
                            below: zoneStats.below_std_count,
                            above_percent: zoneStats.above_std_percentage,
                            below_percent: zoneStats.below_std_percentage
                          };
                        } else {
                          zoneGradeData[grade] = {
                            total: 0,
                            above: 0,
                            below: 0,
                            above_percent: 0,
                            below_percent: 0
                          };
                        }
                      });

                      // Calculate total above standard records for this zone (sum of all grades above)
                      const zoneTotalAbove = Object.values(zoneGradeData).reduce((sum, grade) => sum + grade.above, 0);

                      // Calculate percentages for each grade relative to total above
                      const gradeAbovePercentages = {};
                      availableGrades.forEach(grade => {
                        gradeAbovePercentages[grade] = zoneTotalAbove > 0 ? 
                          (zoneGradeData[grade].above / zoneTotalAbove) * 100 : 0;
                      });

                      // Get grade colors
                      const getGradeColor = (grade) => {
                        switch(grade) {
                          case 'A': return 'bg-green-500';
                          case 'B': return 'bg-yellow-500';
                          case 'C': return 'bg-orange-500';
                          case 'D': return 'bg-red-500';
                          default: return 'bg-gray-500';
                        }
                      };

                      return (
                        <tr key={zoneName} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{zoneName}</td>
                          <td className="px-4 py-2 font-semibold text-green-600">
                            {zoneTotalAbove.toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            {zoneTotalAbove > 0 ? (
                              <div className="space-y-2">
                                {/* Combined Bar */}
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                    <div className="flex h-full">
                                      {availableGrades.map(grade => {
                                        const percentage = gradeAbovePercentages[grade];
                                        return percentage > 0 ? (
                                          <div
                                            key={grade}
                                            className={`${getGradeColor(grade)} h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                                            style={{ width: `${percentage}%` }}
                                            title={`เกรด ${grade}: ${zoneGradeData[grade].above.toLocaleString()} (${percentage.toFixed(1)}%)`}
                                          >
                                            {percentage > 15 && (
                                              <span>{zoneGradeData[grade].above.toLocaleString()}</span>
                                            )}
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Grade Details */}
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {availableGrades.map(grade => (
                                    zoneGradeData[grade].above > 0 && (
                                      <div key={grade} className="flex items-center gap-1">
                                        <div className={`w-3 h-3 ${getGradeColor(grade)} rounded-sm`}></div>
                                        <span className="font-medium">เกรด {grade}:</span>
                                        <span className="text-gray-700">
                                          {zoneGradeData[grade].above.toLocaleString()} ({gradeAbovePercentages[grade].toFixed(1)}%)
                                        </span>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic">
                                No records above standard
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-800 font-medium">
              {loadingStage || "Loading optimized data for all grades..."}
            </p>
            <span className="text-blue-600 text-sm font-semibold">
              {loadingProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {loadingProgress === 100
              ? "Optimized analysis complete for all grades!"
              : `Loading ${dataLimit.toLocaleString()} records per grade with memory optimization...`}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-600">
            {error.includes("400") || error.includes("BAD_REQUEST")
              ? "โปรดเลือกตัวเลือกการเปรียบเทียบอย่างน้อย 1 ตัวเลือก"
              : `ไม่พบค่ามาตรฐานที่ท่านเลือก โปรดเลือกการกรองข้อมูลอื่น`}
          </p>
          <p className="text-red-500 text-sm mt-1">
            Please modify your filters and click &quot;Apply Changes&quot; to try again.
          </p>
          <p className="text-blue-600 text-xs mt-1">
            💡 Try reducing the data limit to {DEFAULT_LIMIT.toLocaleString()}{" "}
            for better performance.
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
    </div>
  );
}

export default Map;