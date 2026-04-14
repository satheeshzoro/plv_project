import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";

const UsersDirectory = () => {
  const navigate = useNavigate();
  const { currentUser, currentEditor, isAdminLoggedIn, logoutUser, logoutEditor, logoutAdmin, isAuthChecking, userDirectory } = useAppData();
  const [selectedUser, setSelectedUser] = useState(null);

  const currentActor = useMemo(() => {
    if (isAdminLoggedIn) return { role: "ADMIN", user: null };
    if (currentEditor) return { role: "EDITOR", user: currentEditor };
    if (currentUser) return { role: "USER", user: currentUser };
    return null;
  }, [isAdminLoggedIn, currentEditor, currentUser]);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentActor) {
    return <Navigate to="/" replace />;
  }

  const profileUser = currentActor.user || { role: "ADMIN", username: "Admin" };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={true}
        user={profileUser}
        onSignOut={() => {
          if (isAdminLoggedIn) logoutAdmin();
          else if (currentEditor) logoutEditor();
          else logoutUser();
          navigate("/");
        }}
      />

      <main className="container py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-heading">Registered Users</h1>
          <p className="text-muted-foreground mt-2">
            View user publishing activity and open profile info from the table.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Published Articles</TableHead>
                <TableHead>Submitted Articles</TableHead>
                <TableHead className="text-right">Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDirectory.length > 0 ? userDirectory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.full_name}</TableCell>
                  <TableCell>{row.published_count}</TableCell>
                  <TableCell>{row.submitted_count}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => setSelectedUser(row)}>
                      <Info className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Pen Name:</span> {selectedUser.pen_name || "-"}</div>
              <div><span className="font-medium">Name:</span> {selectedUser.full_name}</div>
              <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UsersDirectory;
