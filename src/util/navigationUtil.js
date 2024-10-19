import { useNavigate } from 'react-router-dom'; // Hook for navigation

export const useHandleView = () => {
  const navigate = useNavigate();

  const handleView = (email) => {
    // Use navigate with state to pass the email to the CustomerHealth component
    navigate('/customer-health', { state: { email } });
  };

  return handleView;
};
