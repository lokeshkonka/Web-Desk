import { checkHealth } from "../Services/Health.Service";

export const healthController = async () => {
  const health = await checkHealth();

  return {
    service: "WebDesk Backend",
    ...health,
  };
};