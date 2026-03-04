import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/useStudents";
import { Camera, X, Plus, Save, Loader2 } from "lucide-react";

export default function StudentProfilePage() {
  const { data: student, isLoading } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLang, setNewLang] = useState("");

  // Sync form when student data loads
  useEffect(() => {
    if (student) {
      setName(student.name || "");
      setBio((student as any).bio || "");
      setSkills([...(student.skills || [])]);
      setLanguages([...(student.languages || [])]);
    }
  }, [student]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

  const addLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  };
  const removeLanguage = (l: string) => setLanguages(languages.filter((la) => la !== l));

  const handleSave = () => {
    updateProfile.mutate({ name, bio, skills, languages });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and skills.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Card */}
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center pt-6 space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {student?.avatar}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{student?.email}</p>
            </div>
            <Badge variant="secondary">Student</Badge>
            {student?.guideName && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Assigned Guide</p>
                <p className="text-sm font-medium">{student.guideName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bio & Details */}
        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={student?.email || ""} disabled className="opacity-60" />
                <p className="text-[11px] text-muted-foreground">Email cannot be changed.</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-0.5 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Programming Languages */}
            <div className="space-y-2">
              <Label>Programming Languages</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {languages.map((l) => (
                  <Badge key={l} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                    {l}
                    <button onClick={() => removeLanguage(l)} className="ml-0.5 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a language..."
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
