useEffect(() => {
  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get(`${apiDomain}/client/data/api/user-preferences`, { 
        params: { email: authEmail } // सध्याच्या यूजरचे preferences मिळवणे
      });
      const preferencesData = response.data;

      const userPreferencesHeadings = preferencesData.headings || [];
      const userPreferencesProduct = preferencesData.product || [];

      // फक्त त्याच headings ठेवणे ज्या यूजरच्या preferences मध्ये आहेत आणि `scm` प्रॉडक्टशी संबंधित आहेत
      const filteredHeadings = tableHeadings.filter(heading =>
        userPreferencesHeadings.includes(heading) && userPreferencesProduct.includes('scm')
      );

      setAccessibleColumns(filteredHeadings); // फक्त योग्य headings सेट करणे
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  fetchUserPreferences();
}, [authEmail, tableHeadings]);

// टेबलमध्ये कॉलम लपवण्यासाठी:
<StyledTableCell
  key={columnIndex}
  className={`${isSiteNameColumn ? 'stickyColumn' : ''} ${!accessibleColumns.includes(heading) ? 'hideColumn' : ''}`}
>
  {renderCellValue(row[heading])}
</StyledTableCell>
