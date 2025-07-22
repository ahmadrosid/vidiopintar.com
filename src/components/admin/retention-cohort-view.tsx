import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RetentionCohortChart } from "./retention-cohort-chart";
import { RetentionCohort } from "@/types/admin";

interface RetentionCohortViewProps {
  initialCohorts: RetentionCohort[];
}

export function RetentionCohortView({ initialCohorts }: RetentionCohortViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cohort Chart */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Retention Trends</CardTitle>
          <CardDescription>
            Weekly retention percentage trends across cohorts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialCohorts.length > 0 ? (
            <RetentionCohortChart data={initialCohorts} />
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No cohort data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cohort Table */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Cohort Details</CardTitle>
          <CardDescription>
            Detailed retention numbers by signup week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Week</th>
                  <th className="text-right p-2 font-medium">Users</th>
                  <th className="text-right p-2 font-medium">D1</th>
                  <th className="text-right p-2 font-medium">D3</th>
                  <th className="text-right p-2 font-medium">D5</th>
                  <th className="text-right p-2 font-medium">D7</th>
                </tr>
              </thead>
              <tbody>
                {initialCohorts.map((cohort) => (
                  <tr key={cohort.cohortPeriod} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">
                      {new Date(cohort.cohortPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-right p-2">{cohort.totalUsers}</td>
                    <td className="text-right p-2">
                      <span className="font-medium">{cohort.day1Percentage.toFixed(1)}%</span>
                    </td>
                    <td className="text-right p-2">
                      <span className="font-medium">{cohort.day3Percentage.toFixed(1)}%</span>
                    </td>
                    <td className="text-right p-2">
                      <span className="font-medium">{cohort.day5Percentage.toFixed(1)}%</span>
                    </td>
                    <td className="text-right p-2">
                      <span className="font-medium">{cohort.day7Percentage.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}