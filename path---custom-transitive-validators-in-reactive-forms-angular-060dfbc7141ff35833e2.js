webpackJsonp([45993978181358],{345:function(e,r){e.exports={data:{markdownRemark:{html:"<hr>\n<p>Advantages of <strong>Reactive</strong> <strong>Forms</strong> over Template Driven Forms stem from the fact, controls are defined in <strong>Component</strong> <strong>programmatically</strong> and assigned to form and its inputs in <strong>Template declaratively</strong></p>\n<p>This makes adding controls dynamically with <code>FormArray</code>, reacting to events with RxJs, Unit testing sans <code>Template</code> all easier with code in component driving the logic, over html directives and /or pipes handling the same in template / dom.</p>\n<p>However, there are aspects to form handling, in particular field validation and respective error messages that are more convenient in templates.</p>\n<p>For example, if a field <em>(email)</em> is required only when <em>field (phone)</em> is not filled in, *<code>ngIf</code> can simply remove or <code>attr.disabled</code> can disable the unrequited <em>field (email)</em> from the DOM, and put it back as a required field based on the <em>field (phone)</em> value.</p>\n<pre>\n\n&lt;form #ngForm=&quot;f&quot; (ngSubmit)=&quot;f.valid &amp;&amp; onSubmit(f)&quot; novalidate&gt;\n &lt;label&gt;\n    Phone &lt;input name=&quot;phone&quot; #ngModel=&quot;phone&quot;   pattern=&quot;[0-9]{9}&quot;&gt;\n &lt;/label&gt;\n &lt;label&gt; `*ngIf=&quot;phone.errors.pattern&quot;&gt;\n   Phone Number should be digits\n &lt;/label&gt;`&lt;/pre&gt;\n &lt;label&gt;\n   Email &lt;input name=&quot;email&quot; #ngModel=&quot;email&quot;&gt;\n &lt;/label&gt;\n &lt;label&gt; `*ngIf=&quot;`phone?.value?.length || email.value?.length`&quot;&gt;\n   Email is required if phone number is not given\n &lt;/label&gt;`\n &lt;button type=&quot;submit'\n  [disabled]=&quot;!f.valid || (!phone.value?.length &amp;&amp; !email.value?.length)&quot;&gt;Submit&lt;/button&gt;&lt;/pre&gt;\n&lt;/form&gt;\n\n</pre>\n<p>In reactive form setup, having <code>*ngIf</code> ain’t going to do any good. The form controls in form group, controlling form’s fields are decoupled from template DOM by design.</p>\n<p>In a reactive form setup even If an *ngIf disables a required input in template DOM, an event must be handled in component to instrument the FormGroup’s contol declared for this input.</p>\n<p><strong>So how can we do declarative style validations in Reactive Forms</strong>?</p>\n<h3>Built in Angular input validators</h3>\n<p>Angular has handful of built in validaitors we could use in our <code>FormGroupBuilder</code> to match the basic HTML 5 validators we use use in templates / DOM (<code>required</code>,<code>minLength</code>,<code>maxLength</code>,<code>pattern</code>,<code>email</code> ).</p>\n<p>A special one <code>compose</code>: is used when more than one validation is needed for the same form field.</p>\n<p>A <strong>limitation</strong> here is, there is <strong>no transitive / cross field validation</strong> built-in where state of one field effects the other. We need custom group level validators, which we can build in a reusable pattern.</p>\n<h3>How to Build reusable custom Cross-Field / Transitive validations</h3>\n<p>Checkout the full implementation by clicking <a href=\"https://codepen.io/simars/pen/ZMYxrm\">[CodePen]</a></p>\n<p>Let consider possible relationships between Field-1 with Field-2, there are 3 possible cases.</p>\n<p>1. Field-1 is required only when Field-2 is given or vice-versa</p>\n<p>2. Field-1 is not required when Field-2 is given or vice-versa</p>\n<p>3. Either of Field-1 or Field-2 are required.</p>\n<p>If Both fields are required, there isn’t any relationship, simply both are Validation.required at their respective field levels.</p>\n<p>This is how we can build a reusable Custom validates for each of these cases.</p>\n<pre>\nclass CustomValidators {\n\n  static requiredWhen(requiredControlName, controlToCheckName) {  \n    return (control: AbstractControl) => {  \n      const required = control.get(requiredControlName);  \n      const toCheck = control.get(controlToCheckName);  \n      if (required.value || !toCheck.value) {  \n        removeErrors(['required'], required);  \n        return null;  \n      }  \n      const errorValue = `${requiredControlName}_Required_When_${controlToCheckName}`;  \n      setErrors({required: errorValue}, required);  \n      return {[errorValue]: true};  \n    };  \n  }\n\n  static requiredEither(requiredControlName, controlToCheckName) {\n    return (control) => {  \n      const required = control.get(requiredControlName);  \n      const toCheck = control.get(controlToCheckName);  \n      if (required.value || toCheck.value) {  \n        removeErrors(['required'], required);  \n        removeErrors(['required'], toCheck);  \n        return null;  \n      }  \n      const errorValue = `${requiredControlName}_Required_Either_${controlToCheckName}`;  \n      setErrors({required: errorValue}, required);  \n      setErrors({required: errorValue}, toCheck);  \n      return {[errorValue]: true};  \n    };  \n  }\n\n  static requiredWhenNot(requiredControlName, controlToCheckName) {\n    return (control) => {  \n      const required = control.get(requiredControlName);  \n      const toCheck = control.get(controlToCheckName);  \n      if (required.value || toCheck.value) {  \n        removeErrors(['required'], required);  \n        return null;  \n      }  \n      const errorValue = `${requiredControlName}_Required_When_Not_${controlToCheckName}`;  \n      setErrors({required: errorValue}, required);  \n      return  {[errorValue]: true};  \n    };  \n  }\n\n}\n\nfunction setErrors(error: {[key: string]: any }, control: AbstractControl) {\n  control.setErrors({...control.errors, ...error});  \n}\n\nfunction  removeErrors(keys: string[], control: AbstractControl) {\n  const remainingErrors = keys.reduce((errors, key) => {  \n    delete  errors[key];  \n    return errors;  \n  }, {...control.errors});  \n  control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);  \n}\n</pre>\n<p>Use them declarively in your your FromBuilder group definations.</p>\n<pre>\n\n class AppComponent implements OnInit  {\n\n  registerForm: FormGroup;\n  submitted = false;\n\n  constructor(@Inject() private formBuilder: FormBuilder) {}\n\n  ngOnInit() {\n        this.registerForm = this.formBuilder.group({  \n            firstName: ['', Validators.required],  \n            phone: ['', [Validators.pattern('[0-9]*')]],  \n            email: ['', [ Validators.email]]  \n        },  \n        {  \n          validator: [  \n            CustomValidators.requiredEither('email', 'phone')  \n          ]  \n        }                                             \n       );  \n    }  \n\n    // convenience getter for easy access to form fields  \n    get f() { return this.registerForm.controls; }  \n\n    onSubmit() {  \n        this.submitted = true;  \n\n        // stop here if form is invalid  \n        if (this.registerForm.invalid) {  \n            return;  \n        }  \n        alert(`Submitted -> ${JSON.stringify(this.registerForm.value)}`);  \n    }\n  }\n</pre>\n<p>Template just reacts to validation control</p>\n<pre>\n&lt;form [formGroup]=\"registerForm\" (ngSubmit)=\"onSubmit()\"&gt\n &lt;label&gt;\n    Phone &lt;input formControlName=&quot;phone&quot;&gt;\n &lt;/label&gt;\n &lt;div *ngIf=&quot;f.phone.errors&quot; class=&quot;invalid-feedback&quot;&gt;\n    &lt;div *ngIf=&quot;f.phone.errors.required&quot;&gt;\n     Phone number is required if email is not given.&lt;/div&gt;\n     &lt;div *ngIf=&quot;f.phone.errors.pattern&quot;&gt;\n     Phone number must match pattern digits&lt;/div&gt;\n &lt;/div&gt;\n &lt;label&gt;\n   Email &lt;input formControlName=&quot;email&quot;&gt;\n &lt;/label&gt;\n &lt;div *ngIf=&quot;f.email.errors&quot;&gt;\n    &lt;div *ngIf=&quot;f.email.errors.required&quot;&gt;\n    Email is required ({{f.email.errors.required}}).\n    &lt;/div&gt;\n    &lt;div *ngIf=&quot;f.email.errors.email&quot;&gt;\n    Email must be a valid email address\n    &lt;/div&gt;\n &lt;/div&gt;\n\n &lt;button [disabled]=&quot;registerForm.invalid&quot; type=&quot;submit&quot;&gt;\n Register\n &lt;/button&gt;\n&lt;form&gt;\n</pre>\n<h2>Try it out on <a href=\"https://codepen.io/simars/pen/ZMYxrm\">CodePen</a></h2>\n<iframe height='720' scrolling='no' title='angular-reactive-from-requiredWhen' src='//codepen.io/simars/embed/ZMYxrm/?height=265&theme-id=0&default-tab=js,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/simars/pen/ZMYxrm/'>angular-reactive-from-requiredWhen</a> by Simar Paul Singh (<a href='https://codepen.io/simars'>@simars</a>) on <a href='https://codepen.io'>CodePen</a>.\n</iframe>",frontmatter:{path:"/custom-transitive-validators-in-reactive-forms-angular",title:"Build {Cross-field / Transitive Validators} for {Reactive Forms} | Angular",author:"Simar Paul Singh",date:"2018-05-07"}}},pathContext:{}}}});
//# sourceMappingURL=path---custom-transitive-validators-in-reactive-forms-angular-060dfbc7141ff35833e2.js.map