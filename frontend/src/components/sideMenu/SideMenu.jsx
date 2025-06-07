const fetchHomeownerName = async (email) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/homeowners/email/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setHomeownerName(response.data.data.name);
  } catch (error) {
    console.error("Error fetching homeowner data:", error);
  }
}; 