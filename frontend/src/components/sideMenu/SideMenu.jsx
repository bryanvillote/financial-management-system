import { API_BASE_URL } from "../../config";

const fetchHomeownerName = async (email) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/homeowners/email/${email}`,
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