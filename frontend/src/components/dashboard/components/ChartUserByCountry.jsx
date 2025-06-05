import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { PieChart } from "@mui/x-charts/PieChart";
import PropTypes from "prop-types";
import * as React from "react";
import { useEffect, useState } from "react";

import { PaidIcon, UnpaidIcon } from "../internals/components/CustomIcons";

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: "primary",
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: "primary",
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

export default function ChartUserByCountry() {
  const [paymentData, setPaymentData] = useState({
    paid: 0,
    unpaid: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/billing");
        const data = await response.json();

        let paid = 0;
        let unpaid = 0;

        data.forEach((billing) => {
          if (billing.status === "Paid") {
            paid += billing.lastPaymentAmount || 0;
          } else {
            unpaid += billing.amount || 0;
          }
        });

        const total = paid + unpaid;
        const percentage = total > 0 ? (paid / total) * 100 : 0;

        setPaymentData({
          paid,
          unpaid,
          total,
          percentage
        });
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const data = [
    { label: "Paid", value: paymentData.paid },
    { label: "Unpaid", value: paymentData.unpaid },
  ];

  const colors = [
    "hsl(142, 76%, 36%)", // Success green
    "hsl(0, 84%, 60%)",   // Error red
  ];

  const paymentStatus = [
    {
      name: "Paid",
      value: paymentData.percentage,
      flag: <PaidIcon />,
      color: colors[0],
    },
    {
      name: "Unpaid",
      value: 100 - paymentData.percentage,
      flag: <UnpaidIcon />,
      color: colors[1],
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Payment Status
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PieChart
            colors={colors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            series={[
              {
                data,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 2,
                highlightScope: { faded: "global", highlighted: "item" },
                cornerRadius: 4,
              },
            ]}
            height={260}
            width={260}
            slotProps={{
              legend: { hidden: true },
            }}
          >
            <PieCenterLabel 
              primaryText={paymentData.total.toLocaleString("en-PH", {
                style: "currency",
                currency: "PHP",
              })} 
              secondaryText="Total Amount" 
            />
          </PieChart>
        </Box>
        {paymentStatus.map((status, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{ alignItems: "center", gap: 2, pb: 2 }}
          >
            {status.flag}
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "500" }}>
                  {status.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {status.value.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={status.value}
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: status.color,
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
