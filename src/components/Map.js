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

  // State for filters - ปรับ limit เริ่มต้น
  const [filters, setFilters] = useState({
    year: 2025,
    start_month: 1,
    end_month: 3,
    project_name: "ratoon_1",
    period: "period1_1_3",
    sugarcane_grade: "A",
    std_type: "mean_median",
    indices: "ndvi",
    zones: "MPDC,SB,MAC,MPV,MPL,MPK,MKS,MKB",
    include_raw_data: true,
    limit: DEFAULT_LIMIT, // ลดลงมาก
    cane_type: "ratoon",
    _t: Date.now(),
    no_cache: true,
  });

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState("ratoon_1");
  const [selectedMonthRange, setSelectedMonthRange] = useState(
    monthRangeOptions[0]
  );
  const [selectedSugarcaneGrade, setSelectedSugarcaneGrade] = useState("A");

  // เพิ่ม state สำหรับการจัดการ performance
  const [dataLimit, setDataLimit] = useState(DEFAULT_LIMIT);
  const [showAllData, setShowAllData] = useState(false);

  const [focusedZone, setFocusedZone] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
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

  // เก็บ reference ของ markers เพื่อ cleanup
  const markersRef = useRef([]);

  const zoneCenters = {
    SB: { lat: 14.862504078842958, lng: 100.358549932741414 },
    MPDC: { lat: 14.84514, lng: 99.75922 },
    MAC: { lat: 15.828701000429223, lng: 104.47471520283926 },
    MPV: { lat: 16.67827120388637, lng: 102.44576336099253 },
    MPL: { lat: 7.067065149704857, lng: 117.59963900704362 },
    MPK: { lat: 16.4840064769643, lng: 102.1212705588527 },
    MKS: { lat: 16.462588608501633, lng: 104.04029264983633 },
    MPKB: { lat: 16.096672809152835, lng: 101.87271858619893 },
  };

  const mapRef = useRef(null);

  // ฟังก์ชัน cleanup markers เพื่อลด memory leak
  const clearAllMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // ฟังก์ชันสำหรับ sampling ข้อมูลเพื่อลด markers
  const sampleData = useCallback((records, maxCount) => {
    if (!records || records.length <= maxCount) return records;

    const step = Math.ceil(records.length / maxCount);
    return records.filter((_, index) => index % step === 0);
  }, []);

  // Memoized grade options
  const gradeOptions = useMemo(() => {
    const period = getPeriodFromMonthRange(selectedMonthRange.value);
    const availableGrades = getAvailableGrades(selectedProjectType, period);

    return availableGrades.map((grade) => ({
      value: grade,
      label: `เกรด ${grade}`,
    }));
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
        await new Promise((resolve) => setTimeout(resolve, 50)); // ลดเวลา delay
      }
    }
  }, []);

  // Fetch all standard values
  const fetchAllStandardValues = useCallback(
    async (filtersToUse) => {
      try {
        setLoadingStage("Fetching standard values...");
        setLoadingProgress(10);

        const allIndicesString = availableIndices
          .map((item) => item.key)
          .join(",");
        const tempParams = new URLSearchParams({
          ...filtersToUse,
          indices: allIndicesString,
          include_raw_data: false,
          limit: 100, // ใช้ limit น้อยสำหรับ standard values
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
    [availableIndices]
  );

  // Fetch analytics data with optimization
  const fetchAnalyticsData = useCallback(
    async (filtersToUse) => {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const stages = [
          "Preparing optimized request...",
          "Fetching limited data...",
          "Processing statistics...",
          "Optimizing markers...",
          "Rendering map...",
        ];

        simulateLoadingProgress(stages);

        setLoadingStage("Fetching limited data...");
        setLoadingProgress(50);

        // ใช้ dataLimit แทน filters.limit
        const optimizedFilters = {
          ...filtersToUse,
          limit: dataLimit,
          _t: Date.now(),
          no_cache: true,
        };

        const params = new URLSearchParams(optimizedFilters);

        console.log(`Fetching with limit: ${dataLimit}`);

        const response = await fetch(`${API_BASE_URL}/analytics?${params}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error("400");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        setLoadingProgress(70);
        setLoadingStage("Processing statistics...");

        const data = await response.json();

        setLoadingProgress(85);
        setLoadingStage("Optimizing markers...");

        // Optimize data by sampling
        if (data.zone_statistics) {
          data.zone_statistics = data.zone_statistics.map((zone) => ({
            ...zone,
            above_records: sampleData(zone.above_records, MAX_MARKERS_PER_ZONE),
            below_records: sampleData(zone.below_records, MAX_MARKERS_PER_ZONE),
          }));
        }

        setAnalyticsData(data);

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
    [dataLimit, simulateLoadingProgress, sampleData]
  );

  // Apply filters function
  const applyFilters = useCallback(async () => {
    setHasUnappliedChanges(false);
    setAppliedFilters({ ...filters });

    // Clear existing markers
    clearAllMarkers();
    setAnalyticsData(null);
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

  // Update standard values
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
          sugarcane_grade: filters.sugarcane_grade,
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
  }, [selectedIndices, standardValues, filters]);

  // Reset standard values
  const resetStandardValues = useCallback(async () => {
    setLoading(true);
    setLoadingProgress(0);

    try {
      setLoadingStage("Resetting standard values...");
      setLoadingProgress(20);

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
          sugarcane_grade: filters.sugarcane_grade,
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
  }, [filters, selectedIndices]);

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

  // Track filter changes
  useEffect(() => {
    if (appliedFilters) {
      const filterKeys = [
        "year",
        "start_month",
        "end_month",
        "project_name",
        "period",
        "sugarcane_grade",
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

// Initialize map with optimized marker creation
useEffect(() => {
  if (!isLoaded || loadError || !analyticsData) return;

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

      // Add center marker
      // const centerMarker = new window.google.maps.Marker({
      //   position: center || { lat: 15.87, lng: 100.9925 },
      //   map,
      //   title: "Center",
      //   icon: {
      //     url: "/manufacturing-plant.png",
      //     scaledSize: new window.google.maps.Size(70, 70),
      //   },
      //   zIndex: 9999,
      // });
      // markersRef.current.push(centerMarker);

      // Add zone markers with optimized info windows
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
        markersRef.current.push(zoneMarker);

        const zoneInfoContent = `
          <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Zone: ${
              zoneStats.zone
            }</h3>
            <div style="margin-bottom: 10px;">
              <strong>Statistics:</strong><br/>
              Total Records: ${zoneStats.total_records}<br/>
              Above Standard: ${
                zoneStats.above_std_count
              } (${zoneStats.above_std_percentage.toFixed(1)}%)<br/>
              Below Standard: ${
                zoneStats.below_std_count
              } (${zoneStats.below_std_percentage.toFixed(1)}%)
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

        // Add limited data points - Above Standard (สีเขียว)
        if (zoneStats.above_records && zoneStats.above_records.length > 0) {
          zoneStats.above_records.forEach((record, index) => {
            if (record.lat && record.lng && index < MAX_MARKERS_PER_ZONE) {
              const dataMarker = new window.google.maps.Marker({
                position: {
                  lat: parseFloat(record.lat),
                  lng: parseFloat(record.lng),
                },
                map,
                title: `${zoneStats.zone} - Above Standard`,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              });
              markersRef.current.push(dataMarker);

              // ✅ CORRECTED: Above Standard Info Window with GREEN styling
              // ใช้ appliedFilters แทน filters และ selectedIndices ที่ได้ apply แล้ว
              const appliedIndices = appliedFilters ? appliedFilters.indices.split(',') : ['ndvi'];
              const recordInfoContent = `
                <div style="max-width: 350px;">
                  <h4 style="margin: 0 0 8px 0; color: #22c55e; font-weight: bold;">✅ Above Standard</h4>
                  <div style="background-color: #f0fdf4; padding: 8px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #bbf7d0;">
                    <p style="margin: 2px 0;"><strong>Zone:</strong> ${record.zone}</p>
                    <p style="margin: 2px 0;"><strong>ประเภทอ้อย:</strong> ${getCaneTypeLabel(record.cane_type || (appliedFilters ? appliedFilters.cane_type : 'ratoon'))}</p>
                    <p style="margin: 2px 0;"><strong>เกรด:</strong> ${appliedFilters ? appliedFilters.sugarcane_grade : 'A'}</p>
                    <p style="margin: 2px 0;"><strong>ปี/เดือน:</strong> ${record.year}/${record.month}</p>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <strong>Vegetation Indices:</strong><br/>
                    ${appliedIndices.map(index => 
                      `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 2px 6px; background-color: #dcfce7; border-radius: 3px; font-size: 12px; border: 1px solid #bbf7d0;">
                        ${index.toUpperCase()}: ${record[index] !== undefined ? Number(record[index]).toFixed(3) : 'N/A'}
                      </span>`
                    ).join('')}
                  </div>
                  <div style="margin-bottom: 8px;">
                    <strong>Standard Values (Current):</strong><br/>
                    ${appliedIndices.map(index => 
                      `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 2px 6px; background-color: #f3f4f6; border-radius: 3px; font-size: 11px;">
                        ${index.toUpperCase()} > ${zoneStats.std_values[index] || 'N/A'}
                      </span>`
                    ).join('')}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    <strong>Location:</strong> ${record.lat}, ${record.lng}
                  </div>
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

        // Add limited data points - Below Standard (สีแดง)
        if (zoneStats.below_records && zoneStats.below_records.length > 0) {
          zoneStats.below_records.forEach((record, index) => {
            if (record.lat && record.lng && index < MAX_MARKERS_PER_ZONE) {
              const dataMarker = new window.google.maps.Marker({
                position: {
                  lat: parseFloat(record.lat),
                  lng: parseFloat(record.lng),
                },
                map,
                title: `${zoneStats.zone} - Below Standard`,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              });
              markersRef.current.push(dataMarker);

              // ✅ CORRECTED: Below Standard Info Window with RED styling
              // ใช้ appliedFilters แทน filters และ selectedIndices ที่ได้ apply แล้ว
              const appliedIndices = appliedFilters ? appliedFilters.indices.split(',') : ['ndvi'];
              const recordInfoContent = `
                <div style="max-width: 350px;">
                  <h4 style="margin: 0 0 8px 0; color: #ef4444; font-weight: bold;">⚠️ Below Standard</h4>
                  <div style="background-color: #fef2f2; padding: 8px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #fecaca;">
                    <p style="margin: 2px 0;"><strong>Zone:</strong> ${record.zone}</p>
                    <p style="margin: 2px 0;"><strong>ประเภทอ้อย:</strong> ${getCaneTypeLabel(record.cane_type || (appliedFilters ? appliedFilters.cane_type : 'ratoon'))}</p>
                    <p style="margin: 2px 0;"><strong>เกรด:</strong> ${appliedFilters ? appliedFilters.sugarcane_grade : 'A'}</p>
                    <p style="margin: 2px 0;"><strong>ปี/เดือน:</strong> ${record.year}/${record.month}</p>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <strong>Vegetation Indices:</strong><br/>
                    ${appliedIndices.map(index => 
                      `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 2px 6px; background-color: #fee2e2; border-radius: 3px; font-size: 12px; border: 1px solid #fecaca;">
                        ${index.toUpperCase()}: ${record[index] !== undefined ? Number(record[index]).toFixed(3) : 'N/A'}
                      </span>`
                    ).join('')}
                  </div>
                  <div style="margin-bottom: 8px;">
                    <strong>Standard Values (Current):</strong><br/>
                    ${appliedIndices.map(index => 
                      `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 2px 6px; background-color: #f3f4f6; border-radius: 3px; font-size: 11px;">
                        ${index.toUpperCase()} > ${zoneStats.std_values[index] || 'N/A'}
                      </span>`
                    ).join('')}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    <strong>Location:</strong> ${record.lat}, ${record.lng}
                  </div>
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

      console.log(
        `Map initialized with ${markersRef.current.length} markers`
      );
    }
  };

  initializeMap();
  
  // ✅ FIXED: ลบ selectedIndices ออกจาก dependencies
  // Map จะ re-render เฉพาะเมื่อมีการ apply changes เท่านั้น
}, [isLoaded, loadError, analyticsData, center, appliedFilters, clearAllMarkers, getCaneTypeLabel]);

// เพิ่ม useEffect แยกสำหรับ update filters เมื่อ selections เปลี่ยน
useEffect(() => {
  const period = getPeriodFromMonthRange(selectedMonthRange.value);
  const availableGrades = getAvailableGrades(selectedProjectType, period);
  const caneType = getCaneTypeForProject(selectedProjectType);

  let newGrade = selectedSugarcaneGrade;
  if (!availableGrades.includes(selectedSugarcaneGrade)) {
    newGrade = availableGrades.length > 0 ? availableGrades[0] : "A";
    setSelectedSugarcaneGrade(newGrade);
  }

  setFilters((prev) => ({
    ...prev,
    project_name: selectedProjectType,
    period: period,
    sugarcane_grade: newGrade,
    start_month: selectedMonthRange.value.start,
    end_month: selectedMonthRange.value.end,
    cane_type: caneType,
    _t: Date.now(),
    no_cache: true,
  }));
}, [
  selectedProjectType,
  selectedMonthRange,
  selectedSugarcaneGrade,
  getPeriodFromMonthRange,
  getAvailableGrades,
  getCaneTypeForProject,
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

  const handleSugarcaneGradeChange = useCallback((grade) => {
    setSelectedSugarcaneGrade(grade);
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

  // ฟังก์ชันสำหรับปรับจำนวนข้อมูล
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
                  ? "You have updated standard values and modified filters. Click Apply to fetch optimized data and update the map."
                  : hasUnappliedStandardChanges
                  ? "You have updated standard values. Click Apply to fetch optimized data and update the map."
                  : "You have modified filters. Click Apply to fetch optimized data and update the map."}
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

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {gradeOptions.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ไม่มีเกรดที่สามารถเลือกได้สำหรับโครงการและช่วงเวลานี้
              </p>
            )}
          </div>

          <div className="md:col-span-4">
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
                    <span className={item.key === "ndvi" ? "" : ""}>
                      {item.label}
                      {item.key === "ndvi"}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Selected: {selectedIndices.length} indices | Optimized
                performance mode active
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
                    updated. Currently selected: {selectedIndices.join(", ")}
                  </p>
                  <p className="text-xs text-orange-600">
                    ⚠️ Changes to standard values will require clicking &quot;Apply
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

      {/* Statistics Summary */}
      {analyticsData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Zone Statistics Summary</h3>
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span>✅ Data applied and current</span>
              <span className="text-xs bg-green-100 px-2 py-1 rounded">
                {markersRef.current.length} markers loaded
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Zone</th>
                  <th className="px-4 py-2 text-left">Total Records</th>
                  <th className="px-4 py-2 text-left">Above Standard</th>
                  <th className="px-4 py-2 text-left">Below Standard</th>
                  <th className="px-4 py-2 text-left w-48">
                    Performance Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.zone_statistics?.map((zone, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-medium">{zone.zone}</td>
                    <td className="px-4 py-2">{zone.total_records}</td>
                    <td className="px-4 py-2 text-green-600">
                      {zone.above_std_count}
                    </td>
                    <td className="px-4 py-2 text-red-600">
                      {zone.below_std_count}
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                        <div
                          className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${zone.above_std_percentage}%` }}
                        >
                          {zone.above_std_percentage > 15
                            ? `${zone.above_std_percentage.toFixed(1)}%`
                            : ""}
                        </div>
                        <div
                          className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${zone.below_std_percentage}%` }}
                        >
                          {zone.below_std_percentage > 15
                            ? `${zone.below_std_percentage.toFixed(1)}%`
                            : ""}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>
                          Above: {zone.above_std_percentage.toFixed(1)}%
                        </span>
                        <span>
                          Below: {zone.below_std_percentage.toFixed(1)}%
                        </span>
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
            <p className="text-blue-800 font-medium">
              {loadingStage || "Loading optimized data..."}
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
              ? "Optimized analysis complete!"
              : `Loading ${dataLimit.toLocaleString()} records with memory optimization...`}
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
