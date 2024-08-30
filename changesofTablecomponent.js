// ... (Rest of your imports and initial code)

useEffect(() => {
  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get(`${apiDomain}/client/data/api/userdata`, { 
        params: { email: authEmail }
      });
      const preferencesData = response.data;
  
      const userPreferencesHeadings = preferencesData.headings || [];
      const userPreferencesProduct = preferencesData.product || [];
  
      // Set filtered headings based on preferences
      const filteredHeadings = tableHeadings.filter(heading =>
        userPreferencesHeadings.includes(heading) && userPreferencesProduct.includes('scm') // 'scm' हे प्रॉडक्ट फिक्स केलंय उदाहरणासाठी
      );
  
      setAccessibleColumns(filteredHeadings);  // accessibleColumns मध्ये filtered headings ठेवा
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  fetchUserPreferences();
}, [authEmail, tableHeadings]);

const isAccessible = (heading) => {
  return accessibleColumns.includes(heading);  // Accessible हेडिंग्सची चाचणी करणे
};

return (
  <>
    <StyledTableContainer component={Paper}>
      <h1>SCM Tracker-:</h1>
      <StyledTable aria-label="customized table">
        <TableHead>
          <TableRow>
            <TableCell style={getHeaderCellStyle()}>#</TableCell>
            {tableHeadings.map((heading, index) => (
              <StyledTableCell
                key={index}
                style={getHeaderCellStyle(heading)}
                className={`
                  ${index === siteNameIndex || index === dataCenterIndex ? 'stickyColumn' : ''}
                  ${!isAccessible(heading) ? 'hideColumn' : ''}
                `}
              >
                {heading}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, rowIndex) => {
            if (row.specialRow) {
              // Handle special rows
              return (
                <StyledTableRow key={`special-${row.type}-${rowIndex}`} className="specialRow">
                  <StyledTableCell colSpan={tableHeadings.length + 1} className="specialRowLabel">
                    {row.label}
                  </StyledTableCell>
                </StyledTableRow>
              );
            } else {
              // Handle regular rows
              return (
                <StyledTableRow key={row._id}>
                  <StyledTableCell>{rowIndex + 1}</StyledTableCell>
                  {tableHeadings.map((heading, columnIndex) => (
                    <StyledTableCell
                      key={columnIndex}
                      className={`
                        ${columnIndex === siteNameIndex || columnIndex === dataCenterIndex ? 'stickyColumn' : ''}
                        ${!isAccessible(heading) ? 'hideColumn' : ''}
                      `}
                    >
                      {renderCellValue(row[heading])}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              );
            }
          })}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
    {/* ... (Rest of your dialogs and modals) */}
  </>
);
useEffect(() => {
  const fetchDataAndPreferences = async () => {
    try {
      // Fetch table data and user preferences simultaneously
      const [tableResponse, preferencesResponse] = await Promise.all([
        axios.get(`${apiDomain}/client/data/api/tableData?includeId=true`),
        axios.get(`${apiDomain}/client/data/api/userdata`, { params: { email: authEmail } })
      ]);

      if (tableResponse.status !== 200 || preferencesResponse.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const rawData = tableResponse.data;
      const preferencesData = preferencesResponse.data;

      const transformedData = transformData(rawData);

      const readOnlyData = transformedData.filter(row =>
        row["Read Only"] === "Yes" && row["selectedTracker"] === "scm"
      );

      const eastData = transformedData.filter(row =>
        row["Time Zone Group"] === "E" &&
        row["Read Only"] === "No" &&
        row["selectedTracker"] === "scm"
      );

      const westData = transformedData.filter(row =>
        row["Time Zone Group"] === "W" &&
        row["Read Only"] === "No" &&
        row["selectedTracker"] === "scm"
      );

      const headings = transformedData.length > 0 ? Object.keys(transformedData[0]).filter(key => 
        key !== '_id' && 
        key !== '__v' && 
        key !== 'Read Only' && 
        key !== 'selectedTracker' && 
        key !== 'Canceled Client'
      ) : [];

      // Set table headings and data only once
      setTableHeadings(headings);
      setTableData([
        { specialRow: true, label: 'READ-ONLY CLIENTS, PATCHING WINDOW 11 PM to 1 AM ET', type: 'Read Only' },
        ...readOnlyData,
        { specialRow: true, label: 'EAST ZONE, PATCHING WINDOW 2 AM to 4 AM ET', type: 'east' },
        ...eastData,
        { specialRow: true, label: 'WEST ZONE, PATCHING WINDOW 4 AM to 6 AM ET', type: 'west' },
        ...westData,
      ]);

      // Filter headings based on user preferences
      const userPreferencesHeadings = preferencesData.headings || [];
      const userPreferencesProduct = preferencesData.product || [];

      const filteredHeadings = headings.filter(heading =>
        userPreferencesHeadings.includes(heading) && userPreferencesProduct.includes('scm')
      );

      setAccessibleColumns(filteredHeadings);
    } catch (error) {
      console.error('Error fetching data or preferences:', error);
    }
  };

  fetchDataAndPreferences();
}, [authEmail]);

// No need to re-fetch user preferences separately

// Fetch dropdown options only if headings change
useEffect(() => {
  const fetchAllDropdownOptions = async () => {
    const headingsOptions = {};

    // Assuming the first 7 headings are the ones to skip
    const relevantHeadings = tableHeadings.slice(7).filter(heading => {
      // Skip headings that don't need dropdowns
      return !['someStringHeading1', 'someStringHeading2'].includes(heading);
    });

    for (const heading of relevantHeadings) {
      const options = await fetchDropdownOptions('scm', heading);
      headingsOptions[heading] = options;
    }

    setDropdownOptions(headingsOptions);
  };

  if (tableHeadings.length > 7) {
    fetchAllDropdownOptions();
  }
}, [tableHeadings]);
