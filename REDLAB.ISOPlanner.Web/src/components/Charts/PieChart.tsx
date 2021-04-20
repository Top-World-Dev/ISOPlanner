import React, { useContext } from "react";
import AppContext from "../../components/App/AppContext";
import { darkTheme, lightTheme } from "../../globalThemes";
import { PieChart, Pie, Legend, Tooltip, Cell, Label as ChartLabel, ResponsiveContainer } from "recharts";

export interface IPieChartStdProps {
  width: number;
  height: number;
  getData: Function;
  label?: string;
  showTooltip?: boolean;
}

export const PieChartStd: React.FunctionComponent<IPieChartStdProps> = (props: IPieChartStdProps) => {

    const appContext = useContext(AppContext);

    const renderLegendText = (name: string, entry: any, index: any) => {
        const { color } = entry;
        const { payload } = entry;

        if (payload.link) {
            return <a href={payload.link}><span style={{ color }}>{name}{' : '}{payload.value}</span></a>;
        } else {
            return <span style={{ color }}>{name}{' : '}{payload.value}</span>;
        }
    };

    return (
        <ResponsiveContainer width={props.width} height={props.height}>
            <PieChart width={props.width} height={props.height}>
                <Pie
                    isAnimationActive={true}
                    animationDuration={1000}
                    data={props.getData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={60}
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={5}
                    legendType="circle"
                >
                    {props.getData()?.map((entry: any, index: any) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <ChartLabel value={props.label} offset={0} position="center" fill={appContext.useDarkMode ? darkTheme.palette?.black : lightTheme.palette?.black}/>
                </Pie>
                {props.showTooltip && <Tooltip></Tooltip>}
                <Legend layout="vertical" align="center" verticalAlign="bottom" formatter={renderLegendText}></Legend>
            </PieChart>
        </ResponsiveContainer>
    );
};
