"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { useMembership } from "@/hooks/useMembership";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

interface Course {
  id: string;
  title: string;
}

const CreateMembership = () => {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createPlan } = useMembership();

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    price_info: "",
    stripe_checkout_url: "",
    benefits: "",
    includes_resources: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCourses(data);
      }
    };

    fetchCourses();
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createPlan({
      ...formData,
      includes_courses: selectedCourses.length > 0 ? selectedCourses : null,
      status: "active",
    });
    
    router.push("/dashboard/memberships");
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Block access if no active subscription
  if (profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  if (!user || !profile) {
    if (!user) router.push("/login");
    return null;
  }

  return (
    <>
      


      
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/memberships")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Memberships
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Create Membership Plan</CardTitle>
                <CardDescription>
                  Set up a recurring membership with exclusive benefits
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Membership Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Premium Membership"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., premium-membership"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be used in the membership URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_description">Short Description</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief tagline for your membership"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of what members will get"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_info">Price Information *</Label>
                    <Input
                      id="price_info"
                      value={formData.price_info}
                      onChange={(e) => setFormData({ ...formData, price_info: e.target.value })}
                      placeholder="e.g., 29€/month"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe_checkout_url">Stripe Checkout URL (opțional)</Label>
                    <Input
                      id="stripe_checkout_url"
                      value={formData.stripe_checkout_url}
                      onChange={(e) => setFormData({ ...formData, stripe_checkout_url: e.target.value })}
                      placeholder="https://buy.stripe.com/..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Lasă gol pentru membership gratuit. Pentru plăți, obține link-ul din Stripe Dashboard → Payment Links.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits (one per line)</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      placeholder="Access to all courses&#10;Monthly live sessions&#10;Private community access"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="includes_resources">Included Resources</Label>
                    <Textarea
                      id="includes_resources"
                      value={formData.includes_resources}
                      onChange={(e) => setFormData({ ...formData, includes_resources: e.target.value })}
                      placeholder="Additional resources included with membership"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Cursuri incluse în membership</Label>
                    {courses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nu ai cursuri create încă. Cursurile create vor apărea aici.
                      </p>
                    ) : (
                      <div className="space-y-3 border rounded-lg p-4">
                        {courses.map((course) => (
                          <div key={course.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => toggleCourse(course.id)}
                            />
                            <Label
                              htmlFor={`course-${course.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {course.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Selectează cursurile care vor fi accesibile doar membrilor acestui plan
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Create Membership Plan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CreateMembership;
