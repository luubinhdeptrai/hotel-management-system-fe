/**
 * Debug script to test Reports API
 * Run this in browser console after logging in
 */

async function testReportsAPI() {
  try {
    console.log('🧪 Testing Reports API...\n');

    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    console.log('✅ Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.error('❌ No token found! Please login first.');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Test 1: Revenue Summary
    console.log('\n📊 Test 1: Revenue Summary');
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const revenueSummaryUrl = `/api/v1/employee/reports/revenue/summary?fromDate=${thirtyDaysAgo}&toDate=${today}&groupBy=day`;
    console.log('URL:', revenueSummaryUrl);
    
    const revenueSummaryResponse = await fetch(revenueSummaryUrl, { headers });
    console.log('Status:', revenueSummaryResponse.status);
    
    const revenueSummaryData = await revenueSummaryResponse.json();
    console.log('Response:', revenueSummaryData);

    // Test 2: Occupancy Forecast
    console.log('\n📈 Test 2: Occupancy Forecast');
    const occupancyUrl = `/api/v1/employee/reports/rooms/occupancy-forecast?startDate=${today}&endDate=${today}&groupBy=day`;
    console.log('URL:', occupancyUrl);
    
    const occupancyResponse = await fetch(occupancyUrl, { headers });
    console.log('Status:', occupancyResponse.status);
    
    const occupancyData = await occupancyResponse.json();
    console.log('Response:', occupancyData);

    console.log('\n✅ API Tests Complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testReportsAPI();
