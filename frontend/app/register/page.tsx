import { Card,CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

export default function Register(){
    return (
        <div className="flex justify-center items-center h-[80vh]">

        <Card className="w-[50%] p-5">
          <CardTitle>Register yourself</CardTitle>
        <Input 
          type="text" 
        />
        <Button>Sign up</Button>
        </Card>
      </div>
    )
}