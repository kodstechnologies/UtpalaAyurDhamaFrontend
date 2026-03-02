import axios from "axios";

async function testFetch() {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/v1/inpatients/patient/69a56cf7cacf857612f2d51d/billing",
      {
        headers: { Authorization: "Bearer " + "placeholder" }, // Need a valid token though, this might just return 401
      },
    );
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
testFetch();
