export const createConfig = (accessToken) => {
  return {
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-type": "application/json",
    },
  };
};
