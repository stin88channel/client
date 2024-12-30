import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/TransactionsHistory.css";
import Header from "../pages/Header";

import mmr_logo from "../assets/mmr_logo.png";

// BANKS LOGOS
import sberLogo from "../assets/banks/sber.png";
import tinkoffLogo from "../assets/banks/tinkoff.png";
import alfaLogo from "../assets/banks/alfabank.png";
import otpLogo from "../assets/banks/OTPBank.png";
import rshbLogo from "../assets/banks/rshb.png";
import solidarnostLogo from "../assets/banks/solidarnost.png";

const TransactionsHistory = ({ showHeader = true }) => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedDeposits, setExpandedDeposits] = useState({});

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/successful-deposits", {
          withCredentials: true,
        });
        setDeposits(response.data);
      } catch (error) {
        console.error("Ошибка при получении депозитов:", error);
        setError(
          error.response?.data?.error || "Ошибка при загрузке депозитов"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <img src={mmr_logo} className="auth_logo" />
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button
              onClick={() => {
                window.location.reload(); // Обновляем страницу
                navigate("/accont/signin"); // Переходим на страницу входа
              }}
              className="back-button"
            >
              Войти в аккаунт
            </button>
            <Link to="https://mmr-info.ru">
              Связаться с тех. поддержкой сайта
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getBankLogo = (bankName) => {
    const bankLogos = {
      СБЕР: sberLogo,
      ТИНЬКОФФ: tinkoffLogo,
      АЛЬФА: alfaLogo,
      ОТП: otpLogo,
      РСХБ: rshbLogo,
      СОЛИДАРНОСТЬ: solidarnostLogo,
    };

    return bankLogos[bankName] || "";
  };

  const handleDepositClick = (depositId) => {
    setExpandedDeposits((prevExpandedDeposits) => ({
      ...prevExpandedDeposits,
      [depositId]: !prevExpandedDeposits[depositId], // Переключаем состояние раскрытия
    }));
  };

  return (
    <>
      {showHeader && <Header />}
      <div className="transactions">
        <div className="transactions-history-container">
          <div className="menu-buttons">
            <button
              className={`menu-button ${
                activeSection === "deposits" ? "active" : ""
              }`}
              onClick={() => toggleSection("deposits")}
            >
              Транзакции
            </button>
            <button
              className={`menu-button ${
                activeSection === "topups" ? "active" : ""
              }`}
              onClick={() => toggleSection("topups")}
            >
              Пополнения
            </button>
            <button
              className={`menu-button ${
                activeSection === "statistics" ? "active" : ""
              }`}
              onClick={() => toggleSection("statistics")}
            >
              Статистика
            </button>
          </div>

          <div className={`section-content ${activeSection ? "expanded" : ""}`}>
            {activeSection === "deposits" && (
              <div className="deposits-section">
                <h3>Депозиты</h3>
                {deposits.map((deposit) => (
                  <div
                    key={deposit._id}
                    className={`deposit-item ${
                      expandedDeposits[deposit._id] ? "expanded" : ""
                    }`}
                    onClick={() => handleDepositClick(deposit._id)} // Обработчик клика для раскрытия
                  >
                    <div className="deposit-summary">
                      <span className="deposit-amount">
                        +{deposit.amount.toFixed(2)}₽
                      </span>
                      <div className="deposit-details">
                        <span className="deposit-date">
                          {new Date(deposit.timestamp).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}
                        </span>
                        <span className="deposit-time">
                          {new Date(deposit.timestamp).toLocaleTimeString(
                            "ru-RU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Дополнительная информация о депозите */}
                    {expandedDeposits[deposit._id] && (
                      <div className="deposit-details expanded">
                        <div className="additional-info">
                          <span className="dot"></span>
                          <span className="deposit-id">
                            ID заявки: {deposit._id}
                          </span>
                        </div>
                        <div className="additional-info">
                          <span className="dot"></span>
                          <span className="deposit-requisites">
                            Реквизиты:{" "}
                            <img
                              src={getBankLogo(deposit.bank)}
                              alt={`${deposit.bank} logo`}
                              className="bank-logo"
                            />{" "}
                            {deposit.botRequisites}
                          </span>
                        </div>
                        <div className="additional-info">
                          <span className="dot"></span>
                          <span className="deposit-status">
                            Статус: {deposit.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === "topups" && (
              <div className="topups-section">
                <h3>Пополнения</h3>
                <p>Информация о пополнениях пока недоступна.</p>
              </div>
            )}

            {activeSection === "statistics" && (
              <div className="statistics-section">
                <h3>Статистика</h3>
                <p>Статистика пока недоступна.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionsHistory;
